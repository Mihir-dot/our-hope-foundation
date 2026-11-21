import type { Request } from 'express';
import { AuditLog } from '../modules/audit/model.js';

export async function writeAudit(
  req: Request | null,
  action: string,
  entity: string,
  entityId?: string,
  summary?: string,
) {
  try {
    await AuditLog.create({
      actorId: req?.user?.id,
      action,
      entity,
      entityId,
      summary,
      ip: req?.ip,
      at: new Date(),
    });
  } catch {
    // never block the main request on audit failure
  }
}
