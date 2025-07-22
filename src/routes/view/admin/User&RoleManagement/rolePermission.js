// 📁 routes/admin/rolePermission.js
import express from "express";
import rolePermissionController from "../../../../app/controllers/view/admin/User&RoleManagement/RolePermissionController.js";

const router = express.Router();
router.get("/", rolePermissionController.show);
export default router;
