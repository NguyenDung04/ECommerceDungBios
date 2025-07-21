// 📁 routes/admin/shop.js
import express from 'express';
import shopController from '../../../../app/controllers/view/admin/User&RoleManagement/ShopController.js';

const router = express.Router();

router.get('/', shopController.show);

router.get('/:id', shopController.getOne);  

export default router;