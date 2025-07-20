import Course from '../app/models/Course.js';

export default async function setGlobalVariables(req, res, next) {
    // Lấy thông tin người dùng từ session
    res.locals.user = req.session?.user || null;

    // Biến số lượng khoá học đã bị xoá mềm (deleted)
    try {
        const count = await Course.countDocumentsDeleted({ deletedAt: { $ne: null } });
        res.locals.deleteCount = count;
    } catch (err) {
        res.locals.deleteCount = 0;
    }

    next();
}
