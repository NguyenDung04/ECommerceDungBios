// 📁 controllers/admin/RolePermissionController.js
export default {
  show(req, res) {
    res.render("admin/User&RoleManagement/rolePermissionM", {
      layout: false,
      title: "Trang quản lý quyền hạn và vai trò",
      url: req.originalUrl,
    });
  },
};
