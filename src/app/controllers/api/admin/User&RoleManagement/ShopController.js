// 📁 controllers/admin/ShopController.js
import User from "../../../../models/Users.js";
import { mongooseToObject } from "../../../../../util/mongoose.js";
import fs from "fs";
import path from "path";

export default {
  // Lấy tất cả shop có role = 'shop'
  async getAll(req, res) {
    try {
      const shops = await User.find({ role: "shop" });

      res.status(200).json({
        success: true,
        message: `Lấy danh sách shop thành công`,
        data: shops,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách shop",
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
          .json({ success: false, message: "Không tìm thấy shop" });
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

  // 🔒 Ban shop
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
          message: "Không tìm thấy shop để ban",
        });
      }

      res.json({
        success: true,
        message: `Đã ban shop ${shop.email}`,
        data: mongooseToObject(shop),
      });
    } catch (err) {
      console.error("[ShopController] banShop error:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi ban shop",
        error: err.message,
      });
    }
  },

  // ✅ Unban shop
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
          message: "Không tìm thấy shop để unban",
        });
      }

      res.json({
        success: true,
        message: `Đã unban shop ${shop.email}`,
        data: mongooseToObject(shop),
      });
    } catch (err) {
      console.error("[ShopController] unbanUser error:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi unban shop",
        error: err.message,
      });
    }
  },

  async getAllLogsAffectingShop(req, res) {
    const shopLogFile = path.join("logs", "shop.log");
    const adminLogFile = path.join("logs", "admin.log");

    try {
      let logs = [];

      // Đọc logs/shop.log (khi shop tự thực hiện hành động)
      if (fs.existsSync(shopLogFile)) {
        const lines = fs.readFileSync(shopLogFile, "utf8").trim().split("\n");
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
            .filter((log) => log && log.actorType === "shop"),
        );
      }

      // Đọc logs/admin.log (khi admin thao tác lên shop)
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
            .filter((log) => log && log.targetRole === "shop"),
        );
      }

      // Sắp xếp theo thời gian mới nhất
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      res.json({ success: true, data: logs });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi đọc log liên quan shop",
        error: err.message,
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
        User.countDocuments({ role: "shop" }),
        User.countDocuments({ role: "shop", isBanned: true }),
        User.countDocuments({ role: "shop", createdAt: { $gte: today } }),
        User.countDocuments({
          role: "shop",
          createdAt: { $gte: firstDayOfMonth },
        }),
        User.countDocuments({
          role: "shop",
          createdAt: { $gte: firstDayOfYear },
        }),
        User.aggregate([
          { $match: { role: "shop" } },
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
      console.error("[ShopController] getStats error:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi thống kê shop",
        error: err.message,
      });
    }
  },
};
