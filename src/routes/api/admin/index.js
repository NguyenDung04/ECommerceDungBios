// 📁 routes/admin/index.js
import express from "express";
import dashboard from "./dashboard.js";
import user from "./User&RoleManagement/user.js";
import shop from "./User&RoleManagement/shop.js";
import adminUser from "./User&RoleManagement/adminUser.js";
import rolePermission from "./User&RoleManagement/rolePermission.js";
import bulkRoutes from "./User&RoleManagement/bulk.js";

const router = express.Router();

// ✅ Route con sẽ tự động được bảo vệ
router.use("/dashboard", dashboard);
router.use("/users", user);
router.use("/shops", shop);
router.use("/admins", adminUser);
router.use("/rolePermissions", rolePermission);
router.use("/bulk", bulkRoutes);

export default router;
