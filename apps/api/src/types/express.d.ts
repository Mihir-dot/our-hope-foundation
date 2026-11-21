import type { Role } from '@ohf/shared';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: {
        id: string;
        email: string;
        role: Role;
        name: string;
      };
    }
  }
}

export {};
