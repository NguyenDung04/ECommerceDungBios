// // 📁 controllers/admin/ShopController.js
// import User from '../../models/Users.js';
// import { multipleMongooseToObject } from '../../../util/mongoose.js';

// export default {
//   async show(req, res) {
//     try {
//       const shops = await User.find({ role: 'shop' });
//       res.render('admin/ShopM', {
//         shops: multipleMongooseToObject(shops),
//         title: 'Quản lý Shop',
//         layout: false,
//         url: req.originalUrl,
//       });
//     } catch (err) {
//       res.status(500).render('error/404', {
//         message: 'Lỗi khi tải danh sách Shop',
//         error: err.message,
//       });
//     }
//   },
// };
