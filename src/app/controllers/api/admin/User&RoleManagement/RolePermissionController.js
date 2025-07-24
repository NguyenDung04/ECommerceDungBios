import User from "../../../../models/Users.js";
import { mongooseToObject } from "../../../../../util/mongoose.js";
import { logByRole } from "../../../../../middleware/logger.js";
import fs from "fs";
import path from "path";

export default {
  // Lấy tất cả người dùng có role = 'user', 'shop', 'admin'
  async getAllRoles(req, res) {
    try {
      const usersAll = await User.find({
        role: { $in: ["user", "shop", "admin"] },
      });

      res.status(200).json({
        success: true,
        message: "Lấy danh sách tất cả người dùng theo vai trò thành công",
        data: usersAll,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách người dùng",
        error: err.message,
      });
    }
  },

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
        // 💡 Lọc các log do user thực hiện và ảnh hưởng đến admin
        .filter((log) => log && log.actorType === "user");

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
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      );
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

      const roleFilter = { role: { $in: ["admin", "user", "shop"] } };

      const [
        totalUsers,
        bannedUsers,
        newUsersToday,
        newUsersThisMonth,
        newUsersThisYear,
        totalBalance,
        totalAdmin,
        totalShop,
        totalUser,
      ] = await Promise.all([
        User.countDocuments(roleFilter),
        User.countDocuments({ ...roleFilter, isBanned: true }),
        User.countDocuments({ ...roleFilter, createdAt: { $gte: today } }),
        User.countDocuments({
          ...roleFilter,
          createdAt: { $gte: firstDayOfMonth },
        }),
        User.countDocuments({
          ...roleFilter,
          createdAt: { $gte: firstDayOfYear },
        }),
        User.aggregate([
          { $match: roleFilter },
          { $group: { _id: null, total: { $sum: "$currentMoney" } } },
        ]),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ role: "shop" }),
        User.countDocuments({ role: "user" }),
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
          totalAdmin,
          totalShop,
          totalUser,
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
