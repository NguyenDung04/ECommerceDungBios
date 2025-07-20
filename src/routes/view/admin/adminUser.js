// 📁 routes/admin/adminUser.js
import express from 'express';
import adminUserController from '../../../app/controllers/view/admin/AdminUserController.js';

const router = express.Router();
router.get('/', adminUserController.show);
export default router;