const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categoryController');
const isAdmin = require("../middelware/isAdmin")
const authMiddleware = require("../middelware/authMiddelware");
/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: دریافت همه دسته‌بندی‌ها
 *     tags:
 *       - Category
 *     responses:
 *       200:
 *         description: لیست دسته‌بندی‌ها با موفقیت دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       401:
 *         description: هیچ دسته‌ای پیدا نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "کتگوری پیدا نشد"
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "مشکلی در دریافت دسته‌ها پیش آمد."
 */
// مسیرها
router.get('/',categoryController.getAllCategories);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: دریافت یک دسته‌بندی بر اساس ID
 *     tags:
 *       - Category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه دسته‌بندی
 *     responses:
 *       200:
 *         description: دسته‌بندی با موفقیت دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: دسته‌بندی پیدا نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "دسته‌بندی پیدا نشد."
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "مشکلی در دریافت دسته‌بندی پیش آمد."
 */


router.get('/:id', categoryController.getCategoryById);
/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: ایجاد دسته‌بندی جدید (ادمین)
 *     tags:
 *       - Category
 *     security:
 *       - bearerAuth: []   # اگر از JWT استفاده می‌کنید
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: نام دسته‌بندی
 *                 example: "لوازم خانگی"
 *               description:
 *                 type: string
 *                 description: توضیحات دسته‌بندی
 *                 example: "دسته‌ای برای لوازم خانگی مختلف"
 *     responses:
 *       201:
 *         description: دسته‌بندی با موفقیت ایجاد شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "دسته‌بندی ایجاد شد"
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: فیلدهای ورودی ناقص یا نامعتبر
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "نام دسته‌بندی الزامی است."
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "مشکلی در ایجاد دسته‌بندی پیش آمد."
 */
router.post('/', authMiddleware, isAdmin, categoryController.createCategory);


/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: ویرایش دسته‌بندی موجود (ادمین)
 *     tags:
 *       - Category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه دسته‌بندی
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: نام دسته‌بندی
 *                 example: "لوازم خانگی"
 *               description:
 *                 type: string
 *                 description: توضیحات دسته‌بندی
 *                 example: "دسته‌ای برای لوازم خانگی مختلف"
 *     responses:
 *       200:
 *         description: دسته‌بندی با موفقیت ویرایش شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "دسته‌بندی ویرایش شد"
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: دسته‌بندی پیدا نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "دسته‌بندی پیدا نشد."
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "مشکلی در ویرایش دسته‌بندی پیش آمد."
 */
router.put('/:id', authMiddleware, isAdmin, categoryController.updateCategory);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: حذف دسته‌بندی موجود (ادمین)
 *     tags:
 *       - Category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه دسته‌بندی که باید حذف شود
 *     responses:
 *       200:
 *         description: دسته‌بندی با موفقیت حذف شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "دسته‌بندی حذف شد"
 *       404:
 *         description: دسته‌بندی پیدا نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "دسته‌بندی پیدا نشد."
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "مشکلی در حذف دسته‌بندی پیش آمد."
 */
router.delete('/:id', authMiddleware, isAdmin, categoryController.deleteCategory);



module.exports = router;
    