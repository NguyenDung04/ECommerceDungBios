import passport from 'passport';
import User from '../../models/Users.js'; // đường dẫn đúng với dự án của bạn
import bcrypt from 'bcrypt';
import { sendMail } from '../../../util/emailer.js';


class AuthController {
    // Đăng nhập API
    async login(req, res, next) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'Vui lòng nhập đủ tên đăng nhập và mật khẩu.' 
            });
        }

        try {
            const user = await User.findOne({ username });
            if (!user) return res.status(401).json({ 
                success: false,
                error: 'Tài khoản không tồn tại.'
            });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ 
                success: false, 
                error: 'Mật khẩu không đúng.' 
            });

            req.login(user, function (err) {
                if (err) {
                    console.error('[Login] req.login error:', err);
                    next(err)
                };

                req.session.user = {
                    name: user.name,
                    role: user.role,
                    avatarUrl: user.avatarUrl,
                    currentMoney: user.currentMoney,
                    level: user.level,
                    isBanned: user.isBanned,
                    deleted: user.deleted,
                };

                return res.status(200).json({
                    success: true,
                    message: 'Đăng nhập thành công',
                    redirect: '/',
                });
            });
        } catch (error) {
            console.error('[Login] Server error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Lỗi máy chủ' 
            });
        }
    }

    // Đăng ký API
    async register(req, res) {
        const { username, email, password, gender } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'Thiếu thông tin đăng ký.' 
            });
        }

        try {
            const existingUser = await User.findOne({
                $or: [{ email }, { username }],
            });

            if (existingUser) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Email hoặc Username đã tồn tại' 
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.create({
                name: username || 'Guest',
                username,
                email,
                gender,
                password: hashedPassword,
                provider: 'local',
                token: Date.now(),
            });

            const { password: pw, ...userData } = newUser.toObject();
            return res.status(201).json({
                success: true,
                message: 'Đăng ký thành công' 
            });
        } catch (err) {
            return res.status(500).json({ 
                success: false,
                error: 'Đăng ký thất bại'
            });
        }
    }
    
    // POST /api/auth/forgot-password/send-code
    async sendResetCode(req, res) {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: 'Vui lòng nhập email.' });
        }

        // 👉 Tùy chỉnh bật/tắt giới hạn gửi lại mã
        const ENABLE_5_MINUTE_LIMIT = false; // Đặt thành false để tắt giới hạn

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(200).json({
                    success: true,
                    message: 'Nếu email tồn tại, mã đặt lại đã được gửi.'
                });
            }

            const now = Date.now();
            if (
                ENABLE_5_MINUTE_LIMIT && 
                user.resetPasswordExpires &&
                user.resetPasswordExpires > now - 5 * 60 * 1000
            ) {
                return res.status(429).json({
                    success: false,
                    error: 'Bạn chỉ có thể yêu cầu mã mới sau 5 phút.'
                });
            }

            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(now + 10 * 60 * 1000); // Mã có hiệu lực 10 phút

            user.resetPasswordCode = code;
            user.resetPasswordExpires = expires;
            await user.save();

            await sendMail({
                to: user.email,
                subject: 'Mã xác nhận đặt lại mật khẩu',
                html: `
                    <p>Xin chào <b>${user.name || user.username}</b>,</p>
                    <p>Bạn đã yêu cầu đặt lại mật khẩu. Đây là mã xác nhận của bạn:</p>
                    <h2 style="color: #2e86de">${code}</h2>
                    <p>Mã có hiệu lực trong vòng <b>10 phút</b>.</p>
                    <p>Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email này.</p>
                    <hr />
                    <p>Trân trọng,<br />DungBios Support</p>
                `,
            });

            return res.status(200).json({
                success: true,
                message: 'Nếu email tồn tại, mã đặt lại đã được gửi.'
            });
        } catch (err) {
            console.error('❌ Lỗi khi gửi mã:', err);
            return res.status(500).json({
                success: false,
                error: 'Lỗi máy chủ khi gửi mã.'
            });
        }
    }

    // POST /api/auth/verify-reset-code
    async verifyResetCode(req, res) {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ success: false, error: 'Thiếu email hoặc mã xác nhận.' });
        }

        try {
            const user = await User.findOne({ email });
            if (
                !user ||
                !user.resetPasswordCode ||
                user.resetPasswordCode !== code ||
                user.resetPasswordExpires < new Date()
            ) {
                return res.status(400).json({ success: false, error: 'Mã không hợp lệ hoặc đã hết hạn.' });
            }

            res.status(200).json({ success: true, message: 'Mã hợp lệ.' });
        } catch (err) {
            res.status(500).json({ success: false, error: 'Lỗi máy chủ khi kiểm tra mã.' });
        }
    }

    // POST /api/auth/reset-password
    async resetPassword(req, res) {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ success: false, error: 'Thiếu thông tin cần thiết.' });
        }

        try {
            const user = await User.findOne({ email });
            if (
                !user ||
                !user.resetPasswordCode ||
                user.resetPasswordCode !== code ||
                user.resetPasswordExpires < new Date()
            ) {
                return res.status(400).json({ success: false, error: 'Mã không hợp lệ hoặc đã hết hạn.' });
            }

            const hashed = await bcrypt.hash(newPassword, 10);
            user.password = hashed;
            user.resetPasswordCode = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            res.status(200).json({ success: true, message: 'Mật khẩu đã được đặt lại.' });
        } catch (err) {
            res.status(500).json({ success: false, error: 'Lỗi máy chủ khi đặt lại mật khẩu.' });
        }
    }
}

export default new AuthController();
