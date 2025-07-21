    // 📁 routes/view/admin/User&RoleManagement/user.js
    import express from 'express';
    import userController from '../../../../app/controllers/view/admin/User&RoleManagement/UserController.js';

    const router = express.Router();  

    router.get('/', userController.show);
    router.get('/:id', userController.getOne);  

    export default router;