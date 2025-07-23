import winston from "winston";
import fs from "fs";
import path from "path";

// Tạo thư mục nếu chưa có
const logDir = "logs";
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

function createLoggerFor(role) {
  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}] ${message}`;
      }),
    ),
    transports: [
      new winston.transports.File({
        filename: path.join(logDir, `${role}.log`),
      }),
    ],
  });
}

// Tạo logger theo role
const userLogger = createLoggerFor("user");
const shopLogger = createLoggerFor("shop");
const adminLogger = createLoggerFor("admin");

const loggerMap = {
  user: userLogger,
  shop: shopLogger,
  admin: adminLogger,
};

export function logByRole(role, messageObj) {
  const logger = loggerMap[role] || userLogger;
  logger.info(JSON.stringify(messageObj));
}
