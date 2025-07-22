import passport from "passport";

class AuthController {
  // Trang đăng nhập
  showLogin(req, res) {
    res.render("auth/login", {
      layout: false,
      title: "Đăng nhập",
      url: req.originalUrl,
    });
  }

  // Trang đăng ký
  showRegister(req, res) {
    res.render("auth/register", {
      layout: false,
      title: "Đăng ký",
      url: req.originalUrl,
    });
  }

  // Trang đổi mật khẩu
  showChangePassword(req, res) {
    res.render("auth/changePassword", {
      layout: false,
      title: "Đổi mật khẩu",
      url: req.originalUrl,
    });
  }

  // Gọi passport để chuyển sang Google OAuth
  showGoogleLogin(req, res, next) {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
    })(req, res, next);
  }

  // Callback Google
  handleGoogleCallback(req, res, next) {
    passport.authenticate(
      "google",
      {
        failureRedirect: "/auth/login",
      },
      (err, user) => {
        if (err || !user) {
          console.error("[Google Callback] Lỗi xác thực:", err);
          return res.redirect("/auth/login");
        }

        req.login(user, (err) => {
          if (err) {
            console.error("[Google Callback] Lỗi khi gọi req.login:", err);
            return res.redirect("/auth/login");
          }

          req.session.user = {
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl,
            currentMoney: user.currentMoney,
            level: user.level,
            isBanned: user.isBanned,
            deleted: user.deleted,
          };

          return res.redirect("/");
        });
      },
    )(req, res, next);
  }

  // Đăng xuất
  logout(req, res) {
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect("/auth/login");
      });
    });
  }
}

export default new AuthController();
