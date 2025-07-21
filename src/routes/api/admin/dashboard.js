// 📁 routes/admin/dashboard.js
import express from 'express'; 
import dashboardController from '../../../app/controllers/api/admin/DashboardController.js';

const router = express.Router();
router.get('/', dashboardController.show);
export default router;