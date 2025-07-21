// 📁 controllers/admin/AdminUserController.js
import User from '../../../../models/Users.js';
import { multipleMongooseToObject } from '../../../../../util/mongoose.js';

export default {
  // Hiển thị danh sách người dùng
  async show(req, res) {
    try {
      const admins = await User.find({ role: 'admin' });
      res.render('admin/User&RoleManagement/adminM', {
        admins: multipleMongooseToObject(admins),
        title: 'Quản lý quản trị viên',
        layout: false,
        url: req.originalUrl,
      });
    } catch (err) {
      console.error('[AdminUsersController] show error:', err);
      res.status(500).render('error/404', {
        message: 'Lỗi khi tải danh sách Người dùng',
        error: err.message,
      });
    }
  },
  
  // Lấy thông tin chi tiết người dùng (cho modal)
  async getOne(req, res) {
    try {
      console.log('Fetching user with ID:', req.params.id);
      
      // Bỏ .lean() nếu muốn sử dụng mongooseToObject
      const admin = await User.findById(req.params.id); 
      
      if (!admin) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy người dùng' 
        });
      }

      res.json({
        success: true,
        data: mongooseToObject(admin) // Giờ sẽ hoạt động vì user là Mongoose document
      });
      
    } catch (err) {
      console.error('[UserController] getOne error:', err);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: err.message
      });
    }
  }
};