import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../lib/ApiError.js';
import type { Role } from '@ohf/shared';

type AccessPayload = { sub: string; email: string; role: Role; name: string };

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return next(ApiError.unauthorized());

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

export function authorize(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (req.user.role === 'owner') return next();
    if (!allowed.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };
}
