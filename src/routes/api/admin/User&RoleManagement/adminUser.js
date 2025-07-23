// 📁 routes/admin/adminUser.js
import express from "express";
import AdminUserController from "../../../../app/controllers/api/admin/User&RoleManagement/AdminUserController.js";

const router = express.Router();

router.get("/", AdminUserController.getAll);

router.post("/:id/balance", AdminUserController.updateBalance);

// 🔒 Ban Admin
router.post("/:id/ban", AdminUserController.banAdmin);

// ✅ Unban Admin
router.post("/:id/unban", AdminUserController.unbanAdmin);

router.get("/logs", AdminUserController.getAllLogsAffectingAdmin);

router.get("/stats", AdminUserController.getStats);

export default router;
