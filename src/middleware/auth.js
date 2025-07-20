// middlewares/auth.js
export function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    return res.redirect('/auth/login'); // hoặc trả JSON nếu là API
  }
} 

export function isAdmin(req, res, next) {
  const user = req.session.user;
  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(403).render('error/404', {
      title: 'Không có quyền truy cập',
      message: 'Bạn không có quyền truy cập vào khu vực này.',
      layout: false // <<< Tắt layout mặc định
    });
  }
}

