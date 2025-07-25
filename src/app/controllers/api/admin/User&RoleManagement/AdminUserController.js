// 📁 controllers/admin/AdminUserController.js
import User from "../../../../models/Users.js";
import { mongooseToObject } from "../../../../../util/mongoose.js";
import fs from "fs";
import path from "path";

export default {
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
