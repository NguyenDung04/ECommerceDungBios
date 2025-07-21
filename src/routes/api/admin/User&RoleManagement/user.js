// 📁 routes/admin/user.js
import express from 'express';
import userController from '../../../../app/controllers/api/admin/User&RoleManagement/UserController.js';

const router = express.Router(); 

router.get('/', userController.getAll);      

router.get('/:id', userController.getOne);   

export default router;