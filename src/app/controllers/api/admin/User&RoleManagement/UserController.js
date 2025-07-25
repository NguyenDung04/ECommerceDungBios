import User from "../../../../models/Users.js";
import { mongooseToObject } from "../../../../../util/mongoose.js";
import { logByRole } from "../../../../../middleware/logger.js";
import fs from "fs";
import path from "path";

export default {
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
};
