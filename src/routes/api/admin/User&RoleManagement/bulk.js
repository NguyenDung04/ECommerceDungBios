import express from "express";
import controller from "../../../../app/controllers/api/admin/User&RoleManagement/BulkUserActionController.js";

const router = express.Router();

// 🔒 Ban/Unban 1 người theo role
router.post("/ban/:id", controller.banUser);
router.post("/unban/:id", controller.unbanUser);

// 🔒 Ban/Unban nhiều người theo role
router.post("/multi-ban", controller.banUsers);
router.post("/multi-unban", controller.unbanUsers);

// 💰 Cập nhật số dư theo role
router.post("/balance/:id", controller.updateBalance);

// 📊 Lấy thống kê người dùng theo role
router.get("/stats", controller.getStats);

export default router;
