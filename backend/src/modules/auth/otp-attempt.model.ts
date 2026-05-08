import { Schema, model, type InferSchemaType } from 'mongoose';

/**
 * Audit row. We do NOT store the OTP or its hash here — only the event.
 * Auto-purges after 90 days via a TTL index.
 */
const otpAttemptSchema = new Schema(
  {
    mobile: { type: String, required: true, index: true },
    event: {
      type: String,
      enum: ['sent', 'verified', 'failed', 'expired', 'locked', 'rate_limited'],
      required: true,
    },
    ip: { type: String },
    userAgent: { type: String },
    providerMessageId: { type: String },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expireAfterSeconds: 60 * 60 * 24 * 90 },
    },
  },
  { versionKey: false },
);

export type OtpAttempt = InferSchemaType<typeof otpAttemptSchema>;
export const OtpAttemptModel = model('OtpAttempt', otpAttemptSchema);
