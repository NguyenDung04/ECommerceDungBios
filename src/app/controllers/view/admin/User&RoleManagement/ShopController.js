// 📁 controllers/admin/ShopController.js
import User from "../../../../models/Users.js";
import {
  multipleMongooseToObject,
  mongooseToObject,
} from "../../../../../util/mongoose.js";
export default {
  // Hiển thị danh sách Shop
  async show(req, res) {
    try {
      const shops = await User.find({ role: "shop" });
      res.render("admin/User&RoleManagement/shopM", {
        shops: multipleMongooseToObject(shops),
        title: "Quản lý Shop",
        layout: false,
        url: req.originalUrl,
      });
    } catch (err) {
      console.error("[ShopController] show error:", err);
      res.status(500).render("error/404", {
        message: "Lỗi khi tải danh sách Shop",
        error: err.message,
      });
    }
  },

  // Lấy thông tin chi tiết Shop (cho modal)
  async getOne(req, res) {
    try {
      console.log("Fetching user with ID:", req.params.id);

      // Bỏ .lean() nếu muốn sử dụng mongooseToObject
      const shop = await User.findById(req.params.id);

      if (!shop) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy Shop",
        });
      }

      res.json({
        success: true,
        data: mongooseToObject(shop), // Giờ sẽ hoạt động vì user là Mongoose document
      });
    } catch (err) {
      console.error("[UserController] getOne error:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: err.message,
      });
    }
  },
};
