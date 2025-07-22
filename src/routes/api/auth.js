// routes/api/auth.js
import express from "express";
import authApiController from "../../app/controllers/api/AuthController.js";

const router = express.Router();

// Đăng nhập
router.post("/login", authApiController.login);

// Đăng ký
router.post("/register", authApiController.register);

// Gửi mã OTP đến email để đặt lại mật khẩu
router.post("/forgot-password/send-code", authApiController.sendResetCode);

// Xác thực mã OTP người dùng nhập
router.post("/forgot-password/verify-code", authApiController.verifyResetCode);

// Đặt lại mật khẩu mới sau khi xác thực mã OTP
router.post("/forgot-password/reset", authApiController.resetPassword);

export default router;
