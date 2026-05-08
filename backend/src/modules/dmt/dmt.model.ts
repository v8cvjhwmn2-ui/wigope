import { Schema, Types, model, type InferSchemaType } from 'mongoose';

const dmtSenderSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    mobile: { type: String, required: true, index: true },
    name: { type: String, required: true },
    kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    providerSenderId: { type: String, default: null },
  },
  { timestamps: true },
);

const dmtBeneficiarySchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifsc: { type: String, required: true, uppercase: true },
    bankName: { type: String, default: null },
    verified: { type: Boolean, default: false },
    providerBeneficiaryId: { type: String, default: null },
  },
  { timestamps: true },
);

dmtBeneficiarySchema.index({ userId: 1, accountNumber: 1 }, { unique: true });

export type DmtSender = InferSchemaType<typeof dmtSenderSchema> & { _id: Types.ObjectId };
export type DmtBeneficiary = InferSchemaType<typeof dmtBeneficiarySchema> & { _id: Types.ObjectId };

export const DmtSenderModel = model('DmtSender', dmtSenderSchema);
export const DmtBeneficiaryModel = model('DmtBeneficiary', dmtBeneficiarySchema);
