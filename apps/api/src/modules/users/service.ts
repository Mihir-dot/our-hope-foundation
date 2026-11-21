import type { Role } from '@ohf/shared';
import { ApiError } from '../../lib/ApiError.js';
import { listQuery } from '../../lib/listQuery.js';
import { hashPassword, publicUser } from '../auth/service.js';
import { User } from './model.js';

async function assertOwnerRemains(userId: string) {
  const owners = await User.countDocuments({ role: 'owner', disabled: false, _id: { $ne: userId } });
  if (owners === 0) throw ApiError.badRequest('At least one active owner is required');
}

export async function listUsers(query: Record<string, unknown>) {
  const { page, limit, skip, filter } = listQuery(query, ['name', 'email']);
  const [rows, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return { items: rows.map(publicUser), total, page, limit };
}

export async function getUser(id: string) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return publicUser(user);
}

export async function createUser(input: { email: string; name: string; password: string; role: Role }) {
  const user = await User.create({
    email: input.email.toLowerCase(),
    name: input.name,
    role: input.role,
    passwordHash: await hashPassword(input.password),
  });
  return publicUser(user);
}

export async function updateUser(
  id: string,
  patch: { name?: string; role?: Role; disabled?: boolean; password?: string },
  actorId: string,
) {
  const user = await User.findById(id).select('+passwordHash');
  if (!user) throw ApiError.notFound('User not found');
  if (patch.name) user.name = patch.name;
  if (patch.password) user.passwordHash = await hashPassword(patch.password);
  if (patch.disabled != null) {
    if (patch.disabled && id === actorId) throw ApiError.badRequest('You cannot disable your own account');
    user.disabled = patch.disabled;
  }
  if (patch.role && patch.role !== user.role) {
    if (user.role === 'owner' && patch.role !== 'owner') await assertOwnerRemains(id);
    user.role = patch.role;
  }
  if (user.role === 'owner' && user.disabled) await assertOwnerRemains(id);
  await user.save();
  return publicUser(user);
}

export async function deleteUser(id: string, actorId: string) {
  if (id === actorId) throw ApiError.badRequest('You cannot delete your own account');
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'owner') await assertOwnerRemains(id);
  await user.deleteOne();
}
