// routes/view/auth.js
import express from 'express';
import authController from '../../app/controllers/view/AuthController.js';

const router = express.Router();

// Trang đăng nhập
router.get('/login', authController.showLogin);

// Trang đăng ký
router.get('/register', authController.showRegister);

// Trang đổi mật khẩu
router.get('/changePassword', authController.showChangePassword);

// Google OAuth
router.get('/google', authController.showGoogleLogin);
router.get('/google/callback', authController.handleGoogleCallback);

// Đăng xuất
router.get('/logout', authController.logout);

export default router;