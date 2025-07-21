import User from '../../../../models/Users.js';
import { mongooseToObject } from '../../../../../util/mongoose.js';

export default {
  // Lấy tất cả người dùng có role = 'user'
  async getAll(req, res) {
    try {
      const users = await User.find({ role: 'user' });

      res.status(200).json({
        success: true,
        message: `Lấy danh sách người dùng thành công`,
        data: users,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách người dùng',
        error: err.message,
      });
    }
  },

  // 🔒 Ban người dùng
  async banUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndUpdate(id, { isBanned: true }, { new: true });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng để ban'
        });
      }

      res.json({
        success: true,
        message: `Đã ban người dùng ${user.email}`,
        data: mongooseToObject(user)
      });
    } catch (err) {
      console.error('[UserController] banUser error:', err);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi ban người dùng',
        error: err.message
      });
    }
  },

  // ✅ Unban người dùng
  async unbanUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndUpdate(id, { isBanned: false }, { new: true });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng để unban'
        });
      }

      res.json({
        success: true,
        message: `Đã unban người dùng ${user.email}`,
        data: mongooseToObject(user)
      });
    } catch (err) {
      console.error('[UserController] unbanUser error:', err);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi unban người dùng',
        error: err.message
      });
    }
  },

  async updateBalance(req, res) {
    try {
      const userId = req.params.id;
      const { amount } = req.body;

      if (typeof amount !== 'number') {
        return res.status(400).json({ success: false, message: 'Số tiền không hợp lệ' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      }

      // ✅ Kiểm tra nếu trừ tiền mà vượt quá số dư
      if (amount < 0 && Math.abs(amount) > user.currentMoney) {
        return res.status(400).json({
          success: false,
          message: `Không thể trừ ${Math.abs(amount).toLocaleString()} đ vì số dư hiện tại chỉ còn ${user.currentMoney.toLocaleString()} đ`
        });
      }

      user.currentMoney += amount;
      await user.save();

      res.json({
        success: true,
        message: `Cập nhật số dư thành công. Số dư mới: ${user.currentMoney.toLocaleString()} đ`,
        data: { currentMoney: user.currentMoney }
      });
    } catch (err) {
      console.error('[UserController] updateBalance error:', err);
      res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
  }
};