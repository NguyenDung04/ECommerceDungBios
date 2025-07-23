import User from "../../../../models/Users.js";
import { mongooseToObject } from "../../../../../util/mongoose.js";
import { logByRole } from "../../../../../middleware/logger.js";
import fs from "fs";
import path from "path";

export default {
    // Lấy tất cả người dùng có role = 'user', 'shop', 'admin'
    async getAllRoles(req, res) {
        try {
            const usersAll = await User.find({ role: { $in: ["user", "shop", "admin"] } });
 
            res.status(200).json({
                success: true,
                message: "Lấy danh sách tất cả người dùng theo vai trò thành công",
                data: usersAll,
            }); 
        } catch (err) {
            res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy danh sách người dùng",
                error: err.message,
            });
        }
    },
};
