// 📁 controllers/admin/ShopController.js
import User from "../../../../models/Users.js";
import { mongooseToObject } from "../../../../../util/mongoose.js";

export default {
  // Lấy tất cả người dùng có role = 'user'
  async getAll(req, res) {
    try {
      const shops = await User.find({ role: "shop" });

      res.status(200).json({
        success: true,
        message: `Lấy danh sách người dùng thành công`,
        data: shops,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách người dùng",
        error: err.message,
      });
    }
  },

  async updateBalance(req, res) {
    try {
      const shopId = req.params.id;
      const { amount } = req.body;

      if (typeof amount !== "number") {
        return res
          .status(400)
          .json({ success: false, message: "Số tiền không hợp lệ" });
      }

      const shop = await User.findById(shopId);
      if (!shop) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy người dùng" });
      }

      // ✅ Kiểm tra nếu trừ tiền mà vượt quá số dư
      if (amount < 0 && Math.abs(amount) > shop.currentMoney) {
        return res.status(400).json({
          success: false,
          message: `Không thể trừ ${Math.abs(amount).toLocaleString()} đ vì số dư hiện tại chỉ còn ${shop.currentMoney.toLocaleString()} đ`,
        });
      }

      shop.currentMoney += amount;
      await shop.save();

      res.json({
        success: true,
        message: `Cập nhật số dư thành công. Số dư mới: ${shop.currentMoney.toLocaleString()} đ`,
        data: { currentMoney: shop.currentMoney },
      });
    } catch (err) {
      console.error("[ShopController] updateBalance error:", err);
      res
        .status(500)
        .json({ success: false, message: "Lỗi server", error: err.message });
    }
  },

  // 🔒 Ban người dùng
  async banShop(req, res) {
    try {
      const { id } = req.params;
      const shop = await User.findByIdAndUpdate(
        id,
        { isBanned: true },
        { new: true },
      );

      if (!shop) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng để ban",
        });
      }

      res.json({
        success: true,
        message: `Đã ban người dùng ${shop.email}`,
        data: mongooseToObject(shop),
      });
    } catch (err) {
      console.error("[ShopController] banShop error:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi ban người dùng",
        error: err.message,
      });
    }
  },

  // ✅ Unban người dùng
  async unbanShop(req, res) {
    try {
      const { id } = req.params;
      const shop = await User.findByIdAndUpdate(
        id,
        { isBanned: false },
        { new: true },
      );

      if (!shop) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng để unban",
        });
      }

      res.json({
        success: true,
        message: `Đã unban người dùng ${shop.email}`,
        data: mongooseToObject(shop),
      });
    } catch (err) {
      console.error("[ShopController] unbanUser error:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi unban người dùng",
        error: err.message,
      });
    }
  },
};
