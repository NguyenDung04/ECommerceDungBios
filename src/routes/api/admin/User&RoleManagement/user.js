import express from "express";
import userController from "../../../../app/controllers/api/admin/User&RoleManagement/UserController.js";

const router = express.Router();

router.get("/", userController.getAll);

router.post("/:id/balance", userController.updateBalance);

// 🔒 Ban user
router.post("/:id/ban", userController.banUser);

// ✅ Unban user
router.post("/:id/unban", userController.unbanUser);

// 🔄 Route lấy log theo role user
router.get("/logs", userController.getAllLogsAffectingUser);

router.get("/stats", userController.getStats);

export default router;
