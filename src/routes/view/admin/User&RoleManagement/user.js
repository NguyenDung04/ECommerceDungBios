// 📁 routes/admin/user.js
import express from 'express';
import userController from '../../../../app/controllers/view/admin/User&RoleManagement/UserController.js';

const router = express.Router(); 

router.get('/', userController.show);

export default router;