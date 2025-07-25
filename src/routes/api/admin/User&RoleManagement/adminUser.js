// 📁 routes/admin/adminUser.js
import express from "express";
import AdminUserController from "../../../../app/controllers/api/admin/User&RoleManagement/AdminUserController.js";

const router = express.Router();

router.get("/logs", AdminUserController.getAllLogsAffectingAdmin);

export default router;
