const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middelware/authMiddelware');
const isAdmin = require('../middelware/isAdmin');

// همه route ها نیاز به احراز هویت دارند
router.use(authMiddleware);

// همه route ها نیاز به دسترسی ادمین دارند
router.use(isAdmin);

// لیست کاربران با pagination و جستجو
router.get('/', userController.getUsers);

// آمار کاربران
router.get('/stats', userController.getUserStats);

// دریافت اطلاعات یک کاربر
router.get('/:id', userController.getUser);

// ایجاد کاربر جدید
router.post('/', userController.createUser);

// ویرایش کاربر
router.put('/:id', userController.updateUser);

// حذف کاربر
router.delete('/:id', userController.deleteUser);

// تغییر وضعیت فعال/غیرفعال کاربر
router.patch('/:id/toggle-status', userController.toggleUserStatus);

module.exports = router;
