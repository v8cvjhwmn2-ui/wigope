import { Schema, Types, model, type InferSchemaType } from 'mongoose';
import { v4 as uuid } from 'uuid';

const userSchema = new Schema(
  {
    mobile: { type: String, required: true, unique: true, index: true }, // E.164 e.g. +919568654684
    name: { type: String, default: null },
    email: { type: String, default: null, sparse: true, lowercase: true, trim: true },
    dob: { type: Date, default: null },

    kycStatus: {
      type: String,
      enum: ['none', 'pending', 'verified', 'rejected'],
      default: 'none',
      index: true,
    },
    kycDocs: {
      panEnc: { type: String, default: null },
      aadhaarLast4: { type: String, default: null },
      aadhaarDocUrl: { type: String, default: null },
      ocrConfidence: { type: Number, default: null },
      submittedAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null },
      rejectionReason: { type: String, default: null },
    },

    walletBalance: { type: Number, default: 0 }, // denormalized cache; ledger is source of truth
    referralCode: { type: String, unique: true, sparse: true, index: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user', index: true },
    isBlocked: { type: Boolean, default: false },
    blockedReason: { type: String, default: null },

    fcmToken: { type: String, default: null },
    deviceInfo: {
      platform: { type: String, default: null },
      model: { type: String, default: null },
      osVersion: { type: String, default: null },
      appVersion: { type: String, default: null },
    },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.pre('save', function (next) {
  if (!this.referralCode && this._id) {
    this.referralCode = `WIGO${(this._id as Types.ObjectId).toString().slice(-6).toUpperCase()}`;
  }
  next();
});

userSchema.index({ createdAt: -1 });

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId };
export const UserModel = model('User', userSchema);

/** Strip sensitive fields before sending to clients. */
export function sanitizeUser(u: UserDoc) {
  return {
    id: String(u._id),
    mobile: u.mobile,
    name: u.name,
    email: u.email,
    kycStatus: u.kycStatus,
    walletBalance: u.walletBalance,
    referralCode: u.referralCode,
    role: u.role,
    createdAt: (u as unknown as { createdAt?: Date }).createdAt ?? null,
  };
}

export { uuid as _uuid };
