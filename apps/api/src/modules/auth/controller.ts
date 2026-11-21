import type { Request, Response } from 'express';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { sendSuccess } from '../../lib/apiResponse.js';
import { writeAudit } from '../../lib/audit.js';
import { REFRESH_COOKIE, clearRefreshCookie, currentUser, forgotPassword, login, refreshSession, resetPassword, setRefreshCookie } from './service.js';

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await login(req.body.email, req.body.password);
  setRefreshCookie(res, result.user.id);
  await writeAudit(req, 'auth.login', 'user', result.user.id, result.user.email);
  sendSuccess(res, result);
});

export const refreshHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await refreshSession(req.cookies?.[REFRESH_COOKIE]);
  setRefreshCookie(res, result.user.id);
  sendSuccess(res, result);
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response) => {
  clearRefreshCookie(res);
  await writeAudit(req, 'auth.logout', 'user', req.user?.id);
  sendSuccess(res, { ok: true });
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await currentUser(req.user!.id));
});

export const forgotHandler = asyncHandler(async (req: Request, res: Response) => {
  await forgotPassword(req.body.email);
  sendSuccess(res, { ok: true });
});

export const resetHandler = asyncHandler(async (req: Request, res: Response) => {
  await resetPassword(req.body.token, req.body.password);
  sendSuccess(res, { ok: true });
});
