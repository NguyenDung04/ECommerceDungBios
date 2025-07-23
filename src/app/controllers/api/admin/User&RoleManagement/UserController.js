import User from "../../../../models/Users.js";
import { mongooseToObject } from "../../../../../util/mongoose.js";
import { logByRole } from "../../../../../middleware/logger.js";
import fs from "fs";
import path from "path";

export default {
  // Lấy tất cả người dùng có role = 'user'
  async getAll(req, res) {
    try {
      const users = await User.find({ role: "user" });

      res.status(200).json({
        success: true,
        message: `Lấy danh sách người dùng thành công`,
        data: users,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách người dùng",
        error: err.message,
      });
    }
  },

  // 🔒 Ban người dùng
  async banUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndUpdate(
        id,
        { isBanned: true },
        { new: true },
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng để ban",
        });
      }

      logByRole("admin", {
        actorId: req.session?.user?._id,
        actorType: "admin",
        action: "ban_user",
        target: user._id,
        extra: { email: user.email },
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      res.json({
        success: true,
        message: `Đã ban người dùng ${user.email}`,
        data: mongooseToObject(user),
      });
    } catch (err) {
      console.error("[UserController] banUser error:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi ban người dùng",
        error: err.message,
      });
    }
  },

  // ✅ Unban người dùng
  async unbanUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndUpdate(
        id,
        { isBanned: false },
        { new: true },
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng để unban",
        });
      }

      logByRole("admin", {
        actorId: req.session?.user?._id,
        actorType: "admin",
        action: "unban_user",
        target: user._id,
        extra: { email: user.email },
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      res.json({
        success: true,
        message: `Đã unban người dùng ${user.email}`,
        data: mongooseToObject(user),
      });
    } catch (err) {
      console.error("[UserController] unbanUser error:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi unban người dùng",
        error: err.message,
      });
    }
  },

  async updateBalance(req, res) {
    try {
      const userId = req.params.id;
      const { amount } = req.body;

      if (typeof amount !== "number") {
        return res
          .status(400)
          .json({ success: false, message: "Số tiền không hợp lệ" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy người dùng" });
      }

      // ✅ Kiểm tra nếu trừ tiền mà vượt quá số dư
      if (amount < 0 && Math.abs(amount) > user.currentMoney) {
        return res.status(400).json({
          success: false,
          message: `Không thể trừ ${Math.abs(amount).toLocaleString()} đ vì số dư hiện tại chỉ còn ${user.currentMoney.toLocaleString()} đ`,
        });
      }

      logByRole("admin", {
        actorId: req.session?.user?._id,
        actorType: "admin",
        action: amount >= 0 ? "add_money" : "deduct_money",
        target: user._id,
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
      console.error("[UserController] updateBalance error:", err);
      res
        .status(500)
        .json({ success: false, message: "Lỗi server", error: err.message });
    }
  },

  // 📂 Gộp cả admin.log và user.log, lọc theo targetRole
  async getAllLogsAffectingUser(req, res) {
    const userLogFile = path.join("logs", "user.log");
    const adminLogFile = path.join("logs", "admin.log");

    try {
      let logs = [];

      // Đọc logs/user.log
      if (fs.existsSync(userLogFile)) {
        const lines = fs.readFileSync(userLogFile, "utf8").trim().split("\n");
        logs.push(
          ...lines
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
            .filter((log) => log && log.actorType === "user"),
        );
      }

      // Đọc logs/admin.log và lọc theo targetRole: "user"
      if (fs.existsSync(adminLogFile)) {
        const lines = fs.readFileSync(adminLogFile, "utf8").trim().split("\n");
        logs.push(
          ...lines
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
            .filter((log) => log && log.targetRole === "user"),
        );
      }

      // Sắp xếp theo thời gian mới nhất
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      res.json({ success: true, data: logs });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi đọc log liên quan user",
        error: err.message,
      });
    }
  },

  // 📊 API thống kê tổng quan người dùng
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
        User.countDocuments({ role: "user" }),
        User.countDocuments({ role: "user", isBanned: true }),
        User.countDocuments({ role: "user", createdAt: { $gte: today } }),
        User.countDocuments({
          role: "user",
          createdAt: { $gte: firstDayOfMonth },
        }),
        User.countDocuments({
          role: "user",
          createdAt: { $gte: firstDayOfYear },
        }),
        User.aggregate([
          { $match: { role: "user" } },
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
      console.error("[UserController] getStats error:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi thống kê người dùng",
        error: err.message,
      });
    }
  },
};
