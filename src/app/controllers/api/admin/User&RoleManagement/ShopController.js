// 📁 controllers/admin/ShopController.js
import User from "../../../../models/Users.js";
import { mongooseToObject } from "../../../../../util/mongoose.js";
import fs from "fs";
import path from "path";

export default {
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
};
