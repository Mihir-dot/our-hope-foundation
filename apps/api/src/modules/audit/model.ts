import mongoose, { Schema } from 'mongoose';

const auditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true, trim: true },
    entity: { type: String, required: true, trim: true },
    entityId: { type: String },
    summary: { type: String, default: '' },
    ip: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { collection: 'auditlogs' },
);

auditLogSchema.index({ at: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });

export const AuditLog = mongoose.models.AuditLog ?? mongoose.model('AuditLog', auditLogSchema);
