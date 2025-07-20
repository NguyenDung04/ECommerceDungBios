import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const Schema = mongoose.Schema;

const User = new Schema({
  googleId: { type: String, default: null},
  name: { type: String, required: true, maxLength: 100 },
  username: { type: String, required: true, sparse: true, default: 'User'},
  email: { type: String, required: true, unique: true, maxLength: 100 },
  password: { type: String, default: null },
  provider: { type: String, enum: ['local', 'google'], required: true },
  role: { type: String, enum: ['user', 'shop', 'admin'], default: 'user' },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  avatarUrl: { type: String, default: '/image/default-user.jpg' },
  token: { type: String, required: true },
  totalDeposit: { type: Number, default: 0 },
  currentMoney: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  isBanned: { type: Boolean, default: false }, 
  resetPasswordCode: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
}, {
  timestamps: true,
});

User.plugin(mongooseDelete, { overrideMethods: 'all', deletedAt: true });

export default mongoose.model('User', User);
