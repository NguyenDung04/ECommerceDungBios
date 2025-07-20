import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const Schema = mongoose.Schema;

const Categories = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  slug: { type: String, required: true, unique: true },
  type: { type: String, enum: ['physical', 'digital'], required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Categories', default: null },
  img: { type: String, default: '/uploads/categories/default.png' },
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true,
});

Categories.plugin(mongooseDelete, { overrideMethods: 'all', deletedAt: true });

export default mongoose.model('Categories', Categories);
