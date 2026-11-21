import mongoose, { Schema } from 'mongoose';
import { roles } from '@ohf/shared';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: [...roles], required: true },
    disabled: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    resetTokenHash: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
  },
  { timestamps: true, collection: 'users' },
);

export const User = mongoose.models.User ?? mongoose.model('User', userSchema);
