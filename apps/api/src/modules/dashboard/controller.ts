import type { Request, Response } from 'express';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { sendSuccess } from '../../lib/apiResponse.js';
import { dashboardCounts } from './service.js';

export const counts = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await dashboardCounts());
});
