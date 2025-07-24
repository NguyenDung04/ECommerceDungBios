// 📁 controllers/admin/RolePermissionController.js
import User from "../../../../models/Users.js";
import {
  multipleMongooseToObject,
  mongooseToObject,
} from "../../../../../util/mongoose.js";

export default {
  async show(req, res) {
    try {
      const userAll = await User.find({
        role: { $in: ["user", "shop", "admin"] },
      });
      res.render("admin/User&RoleManagement/rolePermissionM", {
        userAll: multipleMongooseToObject(userAll),
        title: "Trang quản lý quyền hạn và vai trò",
        layout: false,
        url: req.originalUrl,
      });
    } catch (err) {
      console.error("[RolePermissionController] show error:", err);
      res.status(500).render("error/404", {
        message: "Lỗi khi tải danh sách tât cả người dùng",
        error: err.message,
      });
    }
  },
  // Lấy thông tin chi tiết Shop (cho modal)
  async getOne(req, res) {
    try {
      console.log("Fetching user with ID:", req.params.id);

      // Bỏ .lean() nếu muốn sử dụng mongooseToObject
      const userAll = await User.findById(req.params.id);

      if (!userAll) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy userAll",
        });
      }

      res.json({
        success: true,
        data: mongooseToObject(userAll), // Giờ sẽ hoạt động vì user là Mongoose document
      });
    } catch (err) {
      console.error("[RolePermissionController] getOne error:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: err.message,
      });
    }
  },
};
