// BulkUserActionController.js

import User from "../../../../models/Users.js";
import { mongooseToObject } from "../../../../../util/mongoose.js";
import { logByRole } from "../../../../../middleware/logger.js";

export default {
  // ✅ Ban 1 người dùng theo role
  async banUser(req, res) {
    await toggleBanStatusSingle(req, res, true);
  },

  // ✅ Unban 1 người dùng theo role
  async unbanUser(req, res) {
    await toggleBanStatusSingle(req, res, false);
  },

  // ✅ Ban nhiều người dùng theo role
  async banUsers(req, res) {
    await toggleBanStatusMultiple(req, res, true);
  },

  // ✅ Unban nhiều người dùng theo role
  async unbanUsers(req, res) {
    await toggleBanStatusMultiple(req, res, false);
  },

  // ✅ Cập nhật số dư người dùng theo role
  async updateBalance(req, res) {
    try {
      const userId = req.params.id;
      const { amount, role } = req.body;

      if (typeof amount !== "number") {
        return res
          .status(400)
          .json({ success: false, message: "Số tiền không hợp lệ" });
      }

      if (!["user", "shop", "admin"].includes(role)) {
        return res
          .status(400)
          .json({ success: false, message: "Role không hợp lệ" });
      }

      const user = await User.findOne({ _id: userId, role });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: `Không tìm thấy ${role}` });
      }

      if (amount < 0 && Math.abs(amount) > user.currentMoney) {
        return res.status(400).json({
          success: false,
          message: `Không thể trừ ${Math.abs(amount).toLocaleString()} đ vì số dư chỉ còn ${user.currentMoney.toLocaleString()} đ`,
        });
      }

      logByRole("admin", {
        actorId: req.session?.user?._id,
        actorType: "admin",
        action: amount >= 0 ? "add_money" : "deduct_money",
        target: user._id,
        targetRole: role,
        extra: {
          email: user.email,
          amountChanged: amount,
          newBalance: user.currentMoney + amount,
        },
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      user.currentMoney += amount;
      await user.save();

      res.json({
        success: true,
        message: `Cập nhật số dư thành công. Số dư mới: ${user.currentMoney.toLocaleString()} đ`,
        data: { currentMoney: user.currentMoney },
      });
    } catch (err) {
      console.error("[BulkUserActionController] updateBalance error:", err);
      res
        .status(500)
        .json({ success: false, message: "Lỗi server", error: err.message });
    }
  },
};

// ================== PRIVATE SHARED FUNCTIONS ==================

// 🚀 Ban/Unban 1 người dùng theo role
async function toggleBanStatusSingle(req, res, isBan) {
  try {
    const { id } = req.params;
    const rawRole = req.body.role; // ✅ Lấy từ body thay vì query
    const role = rawRole?.toLowerCase(); // chuẩn hóa

    // Kiểm tra role hợp lệ
    if (!role || !["user", "shop", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Role không hợp lệ" });
    }

    // Tìm và cập nhật người dùng theo id + role
    const user = await User.findOneAndUpdate(
      { _id: id, role },
      { isBanned: isBan },
      { new: true },
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: `Không tìm thấy ${role}` });
    }

    // Ghi log
    logByRole("admin", {
      actorId: req.session?.user?._id,
      actorType: "admin",
      action: `${isBan ? "ban" : "unban"}_${role}`,
      target: user._id,
      targetRole: role,
      extra: { email: user.email },
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: `${isBan ? "Đã ban" : "Đã unban"} ${role} ${user.email}`,
      data: mongooseToObject(user),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Lỗi server khi ${isBan ? "ban" : "unban"} ${req.body.role || ""}`,
      error: err.message,
    });
  }
}

// 🚀 Ban/Unban nhiều người dùng theo role
async function toggleBanStatusMultiple(req, res, isBan) {
  try {
    const { ids, role } = req.body;

    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      !["user", "shop", "admin"].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: "Danh sách ID hoặc vai trò không hợp lệ",
      });
    }

    const result = await User.updateMany(
      { _id: { $in: ids }, role },
      { isBanned: isBan },
    );

    ids.forEach((id) => {
      logByRole("admin", {
        actorId: req.session?.user?._id,
        actorType: "admin",
        action: `${isBan ? "ban" : "unban"}_${role}_bulk`,
        target: id,
        targetRole: role,
        extra: {
          note: `${isBan ? "Bị ban" : "Được unban"} hàng loạt (${role})`,
        },
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
    });

    res.json({
      success: true,
      message: `${isBan ? "Đã ban" : "Đã unban"} ${result.modifiedCount} ${role}(s)`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Lỗi server khi ${isBan ? "ban" : "unban"} ${role}(s)`,
      error: err.message,
    });
  }
}
