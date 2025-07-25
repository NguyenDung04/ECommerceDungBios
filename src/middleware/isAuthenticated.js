// middlewares/auth.js

// Middleware: Kiểm tra đăng nhập
export function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    // Nếu là API, trả JSON lỗi
    if (req.originalUrl.startsWith("/api/")) {
      return res
        .status(401)
        .json({ success: false, message: "Chưa đăng nhập" });
    }
    // Nếu là trang web, chuyển hướng
    return res.redirect("/auth/login");
  }
}

// Middleware: Chỉ cho phép role = "admin"
export function isAdmin(req, res, next) {
  const user = req.session.user;
  if (user && user.role === "admin") {
    return next();
  }

  // Nếu là API
  if (req.originalUrl.startsWith("/api/")) {
    return res
      .status(403)
      .json({ success: false, message: "Không có quyền truy cập" });
  }

  // Nếu là view
  return res.status(403).render("error/403", {
    title: "Không có quyền truy cập",
    message: "Bạn không có quyền truy cập vào khu vực này.",
    layout: false,
  });
}

// Middleware: Yêu cầu admin có level tối thiểu
export function requireAdminLevel(minLevel = 3) {
  return function (req, res, next) {
    const user = req.session.user;
    if (user && user.role === "admin" && user.level >= minLevel) {
      return next();
    }

    // Nếu là API
    if (req.originalUrl.startsWith("/api/")) {
      return res.status(403).json({
        success: false,
        message: `Bạn cần quyền quản trị level ${minLevel}+`,
      });
    }

    // Nếu là view
    return res.status(403).render("error/403", {
      title: "Không đủ quyền",
      message: `Bạn cần quyền quản trị level ${minLevel} trở lên để truy cập.`,
      layout: false,
    });
  };
}

// Middleware: Yêu cầu đúng level cụ thể (ví dụ: "1.2", "2.5")
export function requireLevel(requiredLevel) {
  return function (req, res, next) {
    const user = req.session.user;
    if (user && user.role === "admin" && user.level === requiredLevel) {
      return next();
    }

    // Nếu là API
    if (req.originalUrl.startsWith("/api/")) {
      return res.status(403).json({
        success: false,
        message: `Cần level ${requiredLevel} để truy cập.`,
      });
    }

    // Nếu là view
    return res.status(403).render("error/403", {
      title: "Không đủ quyền",
      message: `Bạn cần quyền quản trị level ${requiredLevel} để truy cập.`,
      layout: false,
    });
  };
}
