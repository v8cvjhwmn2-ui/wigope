import { Schema, model } from 'mongoose';

const RuntimeConfigSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    valueEncrypted: { type: String, required: true },
    isSecret: { type: Boolean, default: false },
    updatedBy: { type: String, default: null },
  },
  { timestamps: true },
);

export const RuntimeConfigModel = model('RuntimeConfig', RuntimeConfigSchema);
