// // 📁 controllers/admin/AdminUserController.js
// import User from '../../models/Users.js';
// import { multipleMongooseToObject } from '../../../util/mongoose.js';

// export default {
//   async show(req, res) {
//     try {
//       const admins = await User.find({ role: 'admin' });
//       res.render('admin/AdminM', {
//         admins: multipleMongooseToObject(admins),
//         title: 'Quản lý Admin',
//         layout: false,
//         url: req.originalUrl,
//       });
//     } catch (err) {
//       res.status(500).render('error/404', {
//         message: 'Lỗi khi tải danh sách Admin',
//         error: err.message,
//       });
//     }
//   },
// };
