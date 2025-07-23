// 📁 controllers/admin/RolePermissionController.js
import User from "../../../../models/Users.js";
import { multipleMongooseToObject } from "../../../../../util/mongoose.js";

export default { 
  async show(req, res) {
    try {
      const userAll = await User.find({ role: { $in: ["user", "shop", "admin"] } });
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
};
