import mongoose, { Schema } from 'mongoose';

const menuItemSchema = new Schema(
  {
    label: { type: String, required: true },
    href: { type: String, required: true },
    description: { type: String, default: undefined },
    children: { type: [Schema.Types.Mixed], default: undefined },
  },
  { _id: false },
);

const menuSchema = new Schema(
  {
    location: { type: String, enum: ['header', 'footer', 'legal'], required: true, unique: true },
    items: { type: [menuItemSchema], default: [] },
  },
  { timestamps: true, collection: 'menus' },
);

export const Menu = mongoose.models.Menu ?? mongoose.model('Menu', menuSchema);
