// 📁 controllers/view/admin/UserController.js
import User from '../../../../models/Users.js';
import { multipleMongooseToObject } from '../../../../../util/mongoose.js';

export default {
  async show(req, res) {
    try {
      const users = await User.find({ role: 'user' });
      res.render('admin/userM', {
        users: multipleMongooseToObject(users),
        title: 'Quản lý Người dùng',
        layout: false,
        url: req.originalUrl,
      });
    } catch (err) {
      res.status(500).render('error/404', {
        message: 'Lỗi khi tải danh sách Người dùng',
        error: err.message,
      });
    }
  }
};
