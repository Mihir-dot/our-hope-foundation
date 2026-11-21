import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import type { Role } from '@ohf/shared';
import { env, isProd } from '../../config/env.js';
import { ApiError } from '../../lib/ApiError.js';
import { sendMail } from '../../lib/mail.js';
import { randomToken, sha256 } from '../../lib/tokens.js';
import { User } from '../users/model.js';

const COST = 12;
export const REFRESH_COOKIE = 'ohf_refresh';

type PublicUser = { id: string; email: string; role: Role; name: string };

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function setRefreshCookie(res: Response, userId: string) {
  const token = jwt.sign({ sub: userId, typ: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL as jwt.SignOptions['expiresIn'],
  });
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions());
}

export function clearRefreshCookie(res: Response) {
  const { maxAge: _maxAge, ...options } = refreshCookieOptions();
  res.clearCookie(REFRESH_COOKIE, options);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, COST);
}

export function publicUser(user: { _id: unknown; email: string; name: string; role: string }): PublicUser {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role as Role,
  };
}

function signAccess(user: PublicUser) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn'] },
  );
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('Invalid email or password');
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match || user.disabled) throw ApiError.unauthorized('Invalid email or password');
  user.lastLoginAt = new Date();
  await user.save();
  const safe = publicUser(user);
  return { accessToken: signAccess(safe), user: safe };
}

export async function refreshSession(token?: string) {
  if (!token) throw ApiError.unauthorized();
  let userId = '';
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub?: string; typ?: string };
    if (payload.typ !== 'refresh' || !payload.sub) throw new Error('invalid');
    userId = payload.sub;
  } catch {
    throw ApiError.unauthorized('Invalid or expired session');
  }
  const user = await User.findById(userId);
  if (!user || user.disabled) throw ApiError.unauthorized('Invalid or expired session');
  const safe = publicUser(user);
  return { accessToken: signAccess(safe), user: safe };
}

export async function forgotPassword(email: string) {
  const user = await User.findOne({ email: email.toLowerCase(), disabled: false });
  if (!user) return;
  const token = randomToken();
  user.resetTokenHash = sha256(token);
  user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();
  const link = `${env.WEB_ORIGIN}/admin/reset-password?token=${token}`;
  await sendMail({
    to: user.email,
    subject: 'Reset your Our Hope Foundation password',
    text: `Use this link within one hour to choose a new password: ${link}`,
    html: `<p>Use this link within one hour to choose a new password.</p><p><a href="${link}">Reset password</a></p>`,
  });
}

export async function resetPassword(token: string, password: string) {
  const user = await User.findOne({
    resetTokenHash: sha256(token),
    resetTokenExpires: { $gt: new Date() },
  }).select('+passwordHash +resetTokenHash +resetTokenExpires');
  if (!user) throw ApiError.badRequest('Reset link is invalid or expired');
  user.passwordHash = await hashPassword(password);
  await user.save();
  await User.updateOne({ _id: user._id }, { $unset: { resetTokenHash: 1, resetTokenExpires: 1 } });
}

export async function currentUser(id: string) {
  const user = await User.findById(id);
  if (!user || user.disabled) throw ApiError.unauthorized();
  return publicUser(user);
}
