import { Schema, Types, model, type InferSchemaType } from 'mongoose';

/**
 * One row per *active* refresh token.
 *
 *  - Refresh rotation: on each /auth/refresh, we set `revokedAt` on the current
 *    row and insert a new row with the same `family` UUID + `replacedBy` link.
 *  - Reuse detection: if a token whose row is already revoked is presented, we
 *    flag the entire `family` as compromised and revoke every row in it.
 *  - Mongo TTL index on `expiresAt` auto-removes long-dead sessions.
 */
const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    family: { type: String, required: true, index: true },
    jti: { type: String, required: true, unique: true, index: true },
    refreshTokenHash: { type: String, required: true },
    deviceFingerprint: { type: String, required: true },
    userAgent: { type: String },
    ip: { type: String },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    revokedAt: { type: Date, default: null },
    revokedReason: {
      type: String,
      enum: [null, 'rotated', 'logout', 'reuse', 'admin_revoke', 'user_blocked'],
      default: null,
    },
    replacedBy: { type: Schema.Types.ObjectId, ref: 'Session', default: null },
  },
  { timestamps: true },
);

export type Session = InferSchemaType<typeof sessionSchema> & { _id: Types.ObjectId };
export const SessionModel = model('Session', sessionSchema);
