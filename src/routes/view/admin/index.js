// 📁 routes/view/admin/index.js
import express from 'express';
import dashboard from './dashboard.js';
import user from './User&RoleManagement/user.js';
import shop from './User&RoleManagement/shop.js';
import adminUser from './User&RoleManagement/adminUser.js';
import rolePermission from './User&RoleManagement/rolePermission.js';

import { isAuthenticated, isAdmin } from '../../../middleware/auth.js'; // ✅ middleware chỉ import 1 lần

const router = express.Router();

// ✅ Gắn middleware bảo vệ tất cả route bên dưới
router.use(isAuthenticated, isAdmin);

// ✅ Route con sẽ tự động được bảo vệ
router.use('/dashboard', dashboard);
router.use('/userM', user);
router.use('/shopM', shop);
router.use('/adminM', adminUser);
router.use('/rolePermissionM', rolePermission);

export default router;
