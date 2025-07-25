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
};
