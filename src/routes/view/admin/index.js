// 📁 routes/view/admin/index.js
import express from "express";
import dashboard from "./dashboard.js";
import user from "./User&RoleManagement/user.js";
import shop from "./User&RoleManagement/shop.js";
import adminUser from "./User&RoleManagement/adminUser.js";
import rolePermission from "./User&RoleManagement/rolePermission.js";
import {
  isAuthenticated,
  isAdmin,
  requireAdminLevel,
  requireLevel,
} from "../../../middleware/isAuthenticated.js";

const router = express.Router();

// ✅ Gắn middleware bảo vệ tất cả route bên dưới
router.use(isAuthenticated, isAdmin);

// ✅ Route con sẽ tự động được bảo vệ
router.use("/dashboard", requireAdminLevel(3), dashboard);

router.use("/userM", requireLevel("1.1"), user);
router.use("/shopM", requireLevel("1.1"), shop);

router.use("/adminM", requireAdminLevel(3), adminUser);
router.use("/rolePermissionM", requireAdminLevel(3), rolePermission);

// // Level 1.x
// router.use("/roleM", requireLevel("1.2"), rolePermission);          // Quản lý vai trò

// // Level 2.x
// router.use("/productM", requireLevel("2.1"), product);
// router.use("/categoryM", requireLevel("2.2"), category);
// router.use("/orderM", requireLevel("2.3"), order);
// router.use("/deliveryM", requireLevel("2.3"), delivery);
// router.use("/sellerM", requireLevel("2.4"), seller);
// router.use("/walletM", requireLevel("2.5"), wallet);
// router.use("/discountM", requireLevel("2.6"), discount);
// router.use("/cmsM", requireLevel("2.7"), cms);
// router.use("/reportM", requireLevel("2.8"), report);
// router.use("/notificationM", requireLevel("2.9"), notification);
// router.use("/settingM", requireLevel("2.10"), setting);

export default router;
