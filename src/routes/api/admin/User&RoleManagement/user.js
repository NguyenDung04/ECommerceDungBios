import express from 'express';
import userController from '../../../../app/controllers/api/admin/User&RoleManagement/UserController.js'; 

const router = express.Router(); 

router.get('/', userController.getAll);

router.post('/:id/balance', userController.updateBalance);

// 🔒 Ban user
router.post('/:id/ban', userController.banUser);

// ✅ Unban user
router.post('/:id/unban', userController.unbanUser);

export default router;
