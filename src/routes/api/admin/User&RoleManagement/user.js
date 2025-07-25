import express from "express";
import userController from "../../../../app/controllers/api/admin/User&RoleManagement/UserController.js";

const router = express.Router();

// 🔄 Route lấy log theo role user
router.get("/logs", userController.getAllLogsAffectingUser);

router.get("/stats", userController.getStats);

export default router;
