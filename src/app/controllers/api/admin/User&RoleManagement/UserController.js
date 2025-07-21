// API Controller - trả về dữ liệu JSON
import User from '../../../../models/Users.js';
import { mongooseToObject } from '../../../util/mongoose.js';

export default {
  async getAll(req, res) {
    try {
      const users = await User.find({ role: 'user' });
      res.json({
        success: true,
        data: users, // không cần toObject nếu không chỉnh sửa thêm
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
  },

  async getOne(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user)
        return res.status(404).json({ success: false, message: 'Không tìm thấy user' });

      res.json({
        success: true,
        data: mongooseToObject(user),
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
  }
};
