import { ApiError } from '../../lib/ApiError.js';
import { present } from '../../lib/present.js';
import { Menu } from './model.js';

const locations = ['header', 'footer', 'legal'] as const;

export async function getMenu(location: string) {
  if (!locations.includes(location as (typeof locations)[number])) throw ApiError.notFound('Menu not found');
  const menu = await Menu.findOne({ location });
  if (!menu) throw ApiError.notFound('Menu not found');
  return present(menu);
}

export async function listMenus() {
  const menus = await Menu.find().sort({ location: 1 });
  return menus.map((menu) => present(menu));
}

export async function updateMenu(location: string, items: unknown[]) {
  if (!locations.includes(location as (typeof locations)[number])) throw ApiError.notFound('Menu not found');
  const menu = await Menu.findOneAndUpdate(
    { location },
    { $set: { items }, $setOnInsert: { location } },
    { new: true, upsert: true },
  );
  return present(menu);
}
