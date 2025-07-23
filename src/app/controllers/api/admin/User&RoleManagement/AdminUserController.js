// 📁 controllers/admin/AdminUserController.js
import User from "../../../../models/Users.js";
import { mongooseToObject } from "../../../../../util/mongoose.js";
import fs from "fs";
import path from "path";

export default {
  // Lấy tất cả quản trị viên có role = 'admin'
  async getAll(req, res) {
    try {
      const admins = await User.find({ role: "admin" });

      res.status(200).json({
        success: true,
        message: `Lấy danh sách quản trị viên thành công`,
        data: admins,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách quản trị viên",
        error: err.message,
      });
    }
  },

  async updateBalance(req, res) {
    try {
      const adminsId = req.params.id;
      const { amount } = req.body;

      if (typeof amount !== "number") {
        return res
          .status(400)
          .json({ success: false, message: "Số tiền không hợp lệ" });
      }

      const admins = await User.findById(adminsId);
      if (!admins) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy quản trị viên" });
      }

      // ✅ Kiểm tra nếu trừ tiền mà vượt quá số dư
      if (amount < 0 && Math.abs(amount) > admins.currentMoney) {
        return res.status(400).json({
          success: false,
          message: `Không thể trừ ${Math.abs(amount).toLocaleString()} đ vì số dư hiện tại chỉ còn ${admins.currentMoney.toLocaleString()} đ`,
        });
      }

      admins.currentMoney += amount;
      await admins.save();

      res.json({
        success: true,
        message: `Cập nhật số dư thành công. Số dư mới: ${admins.currentMoney.toLocaleString()} đ`,
        data: { currentMoney: admins.currentMoney },
      });
    } catch (err) {
      console.error("[AdminUserController] updateBalance error:", err);
      res
        .status(500)
        .json({ success: false, message: "Lỗi server", error: err.message });
    }
  },

  // 🔒 Ban quản trị viên
  async banAdmin(req, res) {
    try {
      const { id } = req.params;
      const admin = await User.findByIdAndUpdate(
        id,
        { isBanned: true },
        { new: true },
      );

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy quản trị viên để ban",
        });
      }

      res.json({
        success: true,
        message: `Đã ban quản trị viên ${admin.email}`,
        data: mongooseToObject(admin),
      });
    } catch (err) {
      console.error("[AdminUserController] banAdminUser error:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi ban quản trị viên",
        error: err.message,
      });
    }
  },

  // ✅ Unban quản trị viên
  async unbanAdmin(req, res) {
    try {
      const { id } = req.params;
      const admin = await User.findByIdAndUpdate(
        id,
        { isBanned: false },
        { new: true },
      );

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy quản trị viên để unban",
        });
      }

      res.json({
        success: true,
        message: `Đã unban quản trị viên ${admin.email}`,
        data: mongooseToObject(admin),
      });
    } catch (err) {
      console.error("[AdminUserController] unbanAdminUser error:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi unban quản trị viên",
        error: err.message,
      });
    }
  },

  // 📦 Lấy log của role = user (người dùng tự thực hiện)
  async getAllLogsAffectingAdmin(req, res) {
    const adminLogFile = path.join("logs", "admin.log");

    try {
      if (!fs.existsSync(adminLogFile)) {
        return res.json({ success: true, data: [] });
      }

      const lines = fs.readFileSync(adminLogFile, "utf8").trim().split("\n");

      const logs = lines
        .map((line) => {
          const match = line.match(/^(.*?) \[INFO\] (.*)$/);
          if (!match) return null;
          const [_, timestamp, raw] = match;
          try {
            return { timestamp, ...JSON.parse(raw) };
          } catch {
            return null;
          }
        })
        .filter((log) => log && log.actorType === "admin");

      res.json({ success: true, data: logs.reverse() });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi đọc log của admin",
        error: error.message,
      });
    }
  },

  async getStats(req, res) {
    try {
      // Thời điểm hiện tại
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      );
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

      // Chạy song song các truy vấn thống kê
      const [
        totalUsers,
        bannedUsers,
        newUsersToday,
        newUsersThisMonth,
        newUsersThisYear,
        totalBalance,
      ] = await Promise.all([
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ role: "admin", isBanned: true }),
        User.countDocuments({ role: "admin", createdAt: { $gte: today } }),
        User.countDocuments({
          role: "admin",
          createdAt: { $gte: firstDayOfMonth },
        }),
        User.countDocuments({
          role: "admin",
          createdAt: { $gte: firstDayOfYear },
        }),
        User.aggregate([
          { $match: { role: "admin" } },
          { $group: { _id: null, total: { $sum: "$currentMoney" } } },
        ]),
      ]);

      const activeUsers = totalUsers - bannedUsers;
      const totalBalanceAmount =
        totalBalance.length > 0 ? totalBalance[0].total : 0;

      res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          bannedUsers,
          newUsersToday,
          newUsersThisMonth,
          newUsersThisYear,
          totalBalance: totalBalanceAmount,
        },
      });
    } catch (err) {
      console.error("[AdminUserController] getStats error:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi thống kê người dùng",
        error: err.message,
      });
    }
  },
};
