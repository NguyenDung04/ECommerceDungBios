// 📁 routes/admin/shop.js
import express from "express";
import shopController from "../../../../app/controllers/api/admin/User&RoleManagement/ShopController.js";

const router = express.Router();

router.get("/logs", shopController.getAllLogsAffectingShop);

router.get("/stats", shopController.getStats);

export default router;
