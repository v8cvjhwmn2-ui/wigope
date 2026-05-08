import { Types } from 'mongoose';
import { z } from 'zod';

import { env } from '../../config/env';
import { Err } from '../../utils/errors';
import { TransactionModel } from '../transaction/transaction.model';
import { walletService } from '../wallet/wallet.service';
import { DmtBeneficiaryModel, DmtSenderModel } from './dmt.model';

export const senderSchema = z.object({
  mobile: z.string().trim().regex(/^(\+91)?[6-9]\d{9}$/),
  name: z.string().trim().min(2).max(80),
});

export const beneficiarySchema = z.object({
  name: z.string().trim().min(2).max(80),
  accountNumber: z.string().trim().regex(/^\d{9,18}$/),
  ifsc: z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/),
  bankName: z.string().trim().max(80).optional(),
});

export const transferSchema = z.object({
  beneficiaryId: z.string().min(3),
  amount: z.coerce.number().min(100).max(25000),
  remarks: z.string().trim().max(120).optional(),
});

const dev = {
  sender: null as null | any,
  beneficiaries: new Map<string, any>(),
  transfers: [] as any[],
};

export const dmtService = {
  async sender(userId: string) {
    if (env.SKIP_INFRA_CONNECT) return dev.sender;
    const sender = await DmtSenderModel.findOne({ userId: new Types.ObjectId(userId) }).lean();
    return sender ? serializeSender(sender) : null;
  },

  async registerSender(userId: string, input: z.infer<typeof senderSchema>) {
    const mobile = normalizeMobile(input.mobile);
    if (env.SKIP_INFRA_CONNECT) {
      dev.sender = {
        id: 'dmt_sender_dev',
        userId,
        mobile,
        name: input.name,
        kycStatus: 'verified',
        providerSenderId: 'UAT-SENDER',
        createdAt: new Date(),
      };
      return dev.sender;
    }

    const sender = await DmtSenderModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $set: {
          mobile,
          name: input.name,
          kycStatus: 'pending',
          providerSenderId: null,
        },
      },
      { upsert: true, new: true },
    ).lean();
    return serializeSender(sender);
  },

  async beneficiaries(userId: string) {
    if (env.SKIP_INFRA_CONNECT) return [...dev.beneficiaries.values()];
    const rows = await DmtBeneficiaryModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
    return rows.map(serializeBeneficiary);
  },

  async addBeneficiary(userId: string, input: z.infer<typeof beneficiarySchema>) {
    if (env.SKIP_INFRA_CONNECT) {
      const id = `bene_${Date.now()}`;
      const row = {
        id,
        userId,
        name: input.name,
        accountNumberMasked: maskAccount(input.accountNumber),
        accountNumber: input.accountNumber,
        ifsc: input.ifsc,
        bankName: input.bankName ?? 'Bank account',
        verified: true,
        providerBeneficiaryId: `UAT-${id}`,
        createdAt: new Date(),
      };
      dev.beneficiaries.set(id, row);
      return row;
    }

    const row = await DmtBeneficiaryModel.create({
      userId: new Types.ObjectId(userId),
      name: input.name,
      accountNumber: input.accountNumber,
      ifsc: input.ifsc,
      bankName: input.bankName ?? null,
      verified: false,
    });
    return serializeBeneficiary(row.toObject());
  },

  async deleteBeneficiary(userId: string, id: string) {
    if (env.SKIP_INFRA_CONNECT) {
      dev.beneficiaries.delete(id);
      return;
    }
    await DmtBeneficiaryModel.deleteOne({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) });
  },

  async transfer(userId: string, input: z.infer<typeof transferSchema>) {
    const beneficiary = env.SKIP_INFRA_CONNECT
      ? dev.beneficiaries.get(input.beneficiaryId)
      : await DmtBeneficiaryModel.findOne({
          _id: new Types.ObjectId(input.beneficiaryId),
          userId: new Types.ObjectId(userId),
        }).lean();
    if (!beneficiary) throw Err.userNotFound();

    const orderId = `DMT${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

    if (env.SKIP_INFRA_CONNECT) {
      const row = {
        id: orderId,
        orderId,
        beneficiaryId: input.beneficiaryId,
        beneficiaryName: beneficiary.name,
        amount: input.amount,
        status: 'pending',
        provider: 'kwikapi-uat',
        remarks: input.remarks ?? null,
        createdAt: new Date(),
      };
      dev.transfers.unshift(row);
      return row;
    }

    await walletService.debit({
      userId,
      amount: input.amount,
      source: 'recharge',
      refType: 'dmt_txn',
      refId: orderId,
      note: `DMT transfer - ${beneficiary.name}`,
    });

    const txn = await TransactionModel.create({
      userId: new Types.ObjectId(userId),
      type: 'dmt',
      service: 'dmt',
      operator: beneficiary.bankName ?? 'Bank transfer',
      recipient: `${beneficiary.name} ${maskAccount(beneficiary.accountNumber)}`,
      amount: input.amount,
      paymentMode: 'wallet',
      gatewayOrderId: orderId,
      status: 'pending',
      meta: {
        beneficiaryId: String(beneficiary._id),
        ifsc: beneficiary.ifsc,
        remarks: input.remarks ?? null,
      },
    });
    return {
      id: String(txn._id),
      orderId,
      beneficiaryId: String(beneficiary._id),
      beneficiaryName: beneficiary.name,
      amount: input.amount,
      status: txn.status,
      provider: 'kwikapi-uat',
      remarks: input.remarks ?? null,
      createdAt: txn.createdAt,
    };
  },

  async transfers(userId: string) {
    if (env.SKIP_INFRA_CONNECT) return dev.transfers;
    const rows = await TransactionModel.find({ userId: new Types.ObjectId(userId), type: 'dmt' })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return rows.map((row) => ({
      id: String(row._id),
      orderId: row.gatewayOrderId,
      beneficiaryName: row.recipient,
      amount: row.amount,
      status: row.status,
      provider: 'kwikapi-uat',
      remarks: row.meta?.remarks ?? null,
      createdAt: row.createdAt,
    }));
  },
};

function serializeSender(row: Record<string, any>) {
  return {
    id: String(row._id),
    mobile: row.mobile,
    name: row.name,
    kycStatus: row.kycStatus,
    providerSenderId: row.providerSenderId ?? null,
    createdAt: row.createdAt ?? null,
  };
}

function serializeBeneficiary(row: Record<string, any>) {
  return {
    id: String(row._id),
    name: row.name,
    accountNumberMasked: maskAccount(row.accountNumber),
    ifsc: row.ifsc,
    bankName: row.bankName ?? null,
    verified: row.verified,
    providerBeneficiaryId: row.providerBeneficiaryId ?? null,
    createdAt: row.createdAt ?? null,
  };
}

function normalizeMobile(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function maskAccount(account: string) {
  return account ? `••••${account.slice(-4)}` : null;
}
