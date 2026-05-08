import { Schema, Types, model, type InferSchemaType } from 'mongoose';

const kycSubmissionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    pan: { type: String, required: true },
    aadhaarLast4: { type: String, required: true },
    aadhaarName: { type: String, required: true },
    dob: { type: Date, default: null },
    address: { type: String, default: null },
    ocrConfidence: { type: Number, default: null },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true },
);

kycSubmissionSchema.index({ userId: 1, createdAt: -1 });
kycSubmissionSchema.index({ status: 1, createdAt: -1 });

export type KycSubmission = InferSchemaType<typeof kycSubmissionSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const KycSubmissionModel = model('KycSubmission', kycSubmissionSchema);
