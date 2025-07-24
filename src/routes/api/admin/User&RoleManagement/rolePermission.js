import express from "express";
import RolePermissionController from "../../../../app/controllers/api/admin/User&RoleManagement/RolePermissionController.js";

const router = express.Router();

router.get("/", RolePermissionController.getAllRoles);

router.get("/logs", RolePermissionController.getAllLogsAffectingAdmin);

router.get("/stats", RolePermissionController.getStats);

export default router;
