// 📁 routes/admin/dashboard.js
import express from 'express'; 
import dashboardController from '../../../app/controllers/view/admin/DashboardController.js';

const router = express.Router();
router.get('/', dashboardController.show);
export default router;