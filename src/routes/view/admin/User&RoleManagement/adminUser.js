// 📁 routes/admin/adminUser.js
import express from "express";
import adminUserController from "../../../../app/controllers/view/admin/User&RoleManagement/AdminUserController.js";

const router = express.Router();

router.get("/", adminUserController.show);

router.get("/:id", adminUserController.getOne);

export default router;
