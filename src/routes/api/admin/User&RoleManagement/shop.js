// 📁 routes/admin/shop.js
import express from 'express';
import shopController from '../../../../app/controllers/api/admin/User&RoleManagement/ShopController.js'; 

const router = express.Router(); 

router.get('/', shopController.getAll); 

router.post('/:id/balance', shopController.updateBalance);

// 🔒 Ban Shop
router.post('/:id/ban', shopController.banShop);

// ✅ Unban Shop
router.post('/:id/unban', shopController.unbanShop);

export default router;