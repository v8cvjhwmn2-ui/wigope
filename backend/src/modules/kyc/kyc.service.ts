import { Types } from 'mongoose';
import { z } from 'zod';

import { env } from '../../config/env';
import { decryptPii, encryptPii } from '../../utils/crypto';
import { Err } from '../../utils/errors';
import { sanitizeOutputString } from '../../middleware/security';
import { UserModel } from '../user/user.model';
import { KycSubmissionModel } from './kyc.model';

export const kycSubmitSchema = z.object({
  pan: z.string().trim().toUpperCase().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Enter a valid PAN'),
  aadhaarLast4: z.string().trim().regex(/^\d{4}$/, 'Enter last 4 digits of Aadhaar'),
  aadhaarName: z.string().trim().min(2).max(80),
  dob: z.string().optional(),
  address: z.string().trim().max(240).optional(),
  ocrConfidence: z.coerce.number().min(0).max(1).optional(),
});

export const kycRejectSchema = z.object({
  reason: z.string().trim().min(3).max(180),
});

const devKyc = new Map<string, any>();

export const kycService = {
  async status(userId: string) {
    if (env.SKIP_INFRA_CONNECT) {
      return devKyc.get(userId) ?? {
        status: 'none',
        submittedAt: null,
        reviewedAt: null,
        aadhaarLast4: null,
        rejectionReason: null,
      };
    }

    const user = await UserModel.findById(userId).lean();
    if (!user) throw Err.userNotFound();
    const latest = await KycSubmissionModel.findOne({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
    return {
      status: user.kycStatus,
      submittedAt: user.kycDocs?.submittedAt ?? latest?.createdAt ?? null,
      reviewedAt: user.kycDocs?.verifiedAt ?? latest?.reviewedAt ?? null,
      aadhaarLast4: decryptPii(user.kycDocs?.aadhaarLast4 ?? latest?.aadhaarLast4 ?? null),
      rejectionReason: user.kycDocs?.rejectionReason ?? latest?.rejectionReason ?? null,
      latestSubmissionId: latest?._id ? String(latest._id) : null,
    };
  },

  async submit(userId: string, input: z.infer<typeof kycSubmitSchema>) {
    const submittedAt = new Date();
    if (env.SKIP_INFRA_CONNECT) {
      const row = {
        id: `kyc_${Date.now()}`,
        userId,
        panMasked: maskPan(input.pan),
        aadhaarLast4: input.aadhaarLast4,
        aadhaarName: input.aadhaarName,
        dob: input.dob ?? null,
        address: input.address ?? null,
        ocrConfidence: input.ocrConfidence ?? null,
        status: 'pending',
        submittedAt,
        reviewedAt: null,
        rejectionReason: null,
      };
      devKyc.set(userId, row);
      return row;
    }

    const user = await UserModel.findById(userId);
    if (!user) throw Err.userNotFound();
    const submission = await KycSubmissionModel.create({
      userId: new Types.ObjectId(userId),
      pan: encryptPii(input.pan),
      aadhaarLast4: encryptPii(input.aadhaarLast4),
      aadhaarName: encryptPii(input.aadhaarName),
      dob: input.dob ? new Date(input.dob) : null,
      address: input.address ? encryptPii(input.address) : null,
      ocrConfidence: input.ocrConfidence ?? null,
      status: 'pending',
    });
    user.kycStatus = 'pending';
    user.kycDocs = {
      ...(user.kycDocs ?? {}),
      panEnc: encryptPii(input.pan),
      aadhaarLast4: encryptPii(input.aadhaarLast4),
      ocrConfidence: input.ocrConfidence ?? null,
      submittedAt,
      rejectionReason: null,
    };
    await user.save();
    return serialize(submission.toObject());
  },

  async pending() {
    if (env.SKIP_INFRA_CONNECT) {
      return [...devKyc.values()].filter((row) => row.status === 'pending');
    }
    const rows = await KycSubmissionModel.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(100).lean();
    return rows.map(serialize);
  },

  async approve(adminId: string, id: string) {
    if (env.SKIP_INFRA_CONNECT) {
      const entry = [...devKyc.values()].find((row) => row.id === id) ?? [...devKyc.values()][0];
      if (!entry) throw Err.userNotFound();
      entry.status = 'approved';
      entry.reviewedAt = new Date();
      entry.reviewedBy = adminId;
      devKyc.set(entry.userId, entry);
      return entry;
    }

    const submission = await KycSubmissionModel.findById(id);
    if (!submission) throw Err.userNotFound();
    submission.status = 'approved';
    submission.set('reviewedBy', new Types.ObjectId(adminId));
    submission.reviewedAt = new Date();
    submission.rejectionReason = null;
    await submission.save();
    await UserModel.updateOne(
      { _id: submission.userId },
      {
        $set: {
          kycStatus: 'verified',
          'kycDocs.verifiedAt': submission.reviewedAt,
          'kycDocs.rejectionReason': null,
        },
      },
    );
    return serialize(submission.toObject());
  },

  async reject(adminId: string, id: string, reason: string) {
    if (env.SKIP_INFRA_CONNECT) {
      const entry = [...devKyc.values()].find((row) => row.id === id) ?? [...devKyc.values()][0];
      if (!entry) throw Err.userNotFound();
      entry.status = 'rejected';
      entry.reviewedAt = new Date();
      entry.reviewedBy = adminId;
      entry.rejectionReason = reason;
      devKyc.set(entry.userId, entry);
      return entry;
    }

    const submission = await KycSubmissionModel.findById(id);
    if (!submission) throw Err.userNotFound();
    submission.status = 'rejected';
    submission.set('reviewedBy', new Types.ObjectId(adminId));
    submission.reviewedAt = new Date();
    submission.rejectionReason = reason;
    await submission.save();
    await UserModel.updateOne(
      { _id: submission.userId },
      {
        $set: {
          kycStatus: 'rejected',
          'kycDocs.rejectionReason': reason,
        },
      },
    );
    return serialize(submission.toObject());
  },
};

function serialize(row: Record<string, any>) {
  const pan = decryptPii(row.pan);
  const aadhaarLast4 = decryptPii(row.aadhaarLast4);
  const aadhaarName = sanitizeOutputString(decryptPii(row.aadhaarName));
  const address = sanitizeOutputString(decryptPii(row.address));
  return {
    id: String(row._id),
    userId: String(row.userId),
    panMasked: maskPan(pan),
    aadhaarLast4,
    aadhaarName,
    dob: row.dob ?? null,
    address,
    ocrConfidence: row.ocrConfidence ?? null,
    status: row.status,
    submittedAt: row.createdAt ?? null,
    reviewedAt: row.reviewedAt ?? null,
    rejectionReason: row.rejectionReason ?? null,
  };
}

function maskPan(pan: string | null) {
  return pan ? `${pan.slice(0, 3)}***${pan.slice(-2)}` : null;
}
