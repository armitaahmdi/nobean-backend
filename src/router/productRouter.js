const express = require('express');
const router = express.Router();

const authMiddleware = require("../middelware/authMiddelware")
const  isAdmin = require("./../middelware/isAdmin")
const productController = require('../controller/productController'); // مسیر به controller
const  {validateProduct} = require("./../utils/validate/productValidat")
/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: دریافت همه محصولات
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: شماره صفحه برای pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: تعداد آیتم‌ها در هر صفحه
 *     responses:
 *       200:
 *         description: لیست محصولات با موفقیت دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "محصول تستی"
 *                       price:
 *                         type: number
 *                         format: float
 *                         example: 250000
 *                       count:
 *                         type: integer
 *                         example: 5
 *                       description:
 *                         type: string
 *                         example: "این یک محصول تستی است"
 *                       imageUrl:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *                       discount:
 *                         type: number
 *                         format: float
 *                         example: 10
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-31T12:34:56.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-31T12:34:56.000Z"
 *                       category:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 3
 *                           name:
 *                             type: string
 *                             example: "کتاب‌ها"
 *       404:
 *         description: هیچ محصولی یافت نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "هیچ محصولی یافت نشد."
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 */

// گرفتن همه محصولات
router.get("/", productController.getAllProducts);
/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: دریافت جزئیات یک محصول
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: آیدی محصول
 *     responses:
 *       200:
 *         description: جزئیات محصول با موفقیت دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "محصول تستی"
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 250000
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 description:
 *                   type: string
 *                   example: "این یک محصول تستی است"
 *                 imageUrl:
 *                   type: string
 *                   example: "https://example.com/image.jpg"
 *                 discount:
 *                   type: number
 *                   format: float
 *                   example: 10
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-08-31T12:34:56.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-08-31T12:34:56.000Z"
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 3
 *                     name:
 *                       type: string
 *                       example: "کتاب‌ها"
 *       400:
 *         description: آیدی محصول نامعتبر است
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid product ID"
 *       404:
 *         description: محصول یافت نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found"
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 */

// گرفتن جزئیات یک محصول
router.get("/:id", productController.getProductById);
/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: ایجاد محصول جدید (فقط توسط ادمین)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - count
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 description: نام محصول
 *                 example: "گوشی موبایل"
 *               price:
 *                 type: number
 *                 format: float
 *                 description: قیمت محصول
 *                 example: 15000000
 *               count:
 *                 type: integer
 *                 description: تعداد موجودی
 *                 example: 10
 *               description:
 *                 type: string
 *                 description: توضیحات محصول
 *                 example: "یک گوشی موبایل با کیفیت عالی"
 *               imageUrl:
 *                 type: string
 *                 description: آدرس تصویر محصول
 *                 example: "https://example.com/phone.jpg"
 *               discount:
 *                 type: number
 *                 format: float
 *                 description: تخفیف محصول (درصد یا عدد)
 *                 example: 15
 *               categoryId:
 *                 type: integer
 *                 description: شناسه دسته‌بندی مرتبط
 *                 example: 3
 *     responses:
 *       201:
 *         description: محصول با موفقیت ایجاد شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "محصول با موفقیت ایجاد شد."
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 12
 *                     name:
 *                       type: string
 *                       example: "گوشی موبایل"
 *                     price:
 *                       type: number
 *                       example: 15000000
 *                     count:
 *                       type: integer
 *                       example: 10
 *                     description:
 *                       type: string
 *                       example: "یک گوشی موبایل با کیفیت عالی"
 *                     imageUrl:
 *                       type: string
 *                       example: "https://example.com/phone.jpg"
 *                     discount:
 *                       type: number
 *                       example: 15
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 3
 *                           name:
 *                             type: string
 *                             example: "الکترونیک"
 *       400:
 *         description: خطای ورودی یا دسته‌بندی نامعتبر
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "لطفاً فیلدهای name, price, count و categoryId را وارد کنید."
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "خطای سرور، لطفاً دوباره تلاش کنید."
 */

// ایجاد محصول جدید (ادمین)
router.post("/", authMiddleware,isAdmin,validateProduct,productController.createProduct);
/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: ویرایش محصول موجود (فقط ادمین)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []   # نیاز به توکن JWT دارد
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه محصولی که باید ویرایش شود
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "کفش نایک"
 *               price:
 *                 type: number
 *                 example: 1200000
 *               count:
 *                 type: integer
 *                 example: 10
 *               description:
 *                 type: string
 *                 example: "کفش اسپرت مردانه"
 *               imageUrl:
 *                 type: string
 *                 example: "https://example.com/shoe.png"
 *               discount:
 *                 type: number
 *                 example: 15
 *               categoryId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: محصول با موفقیت ویرایش شد
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: شناسه یا ورودی نامعتبر است
 *       404:
 *         description: محصول پیدا نشد
 *       500:
 *         description: خطای سرور
 */

// ویرایش محصول موجود (ادمین)
router.put("/:id",authMiddleware,isAdmin,validateProduct, productController.updateProduct);
/**
 * @swagger
 * /api/v1/products/{id}:
 *   patch:
 *     summary: آپدیت جزئی محصول (فقط ادمین)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []   # نیاز به توکن JWT دارد
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه محصولی که باید آپدیت شود
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "کفش آدیداس"
 *               price:
 *                 type: number
 *                 example: 950000
 *               count:
 *                 type: integer
 *                 example: 5
 *               description:
 *                 type: string
 *                 example: "کفش مخصوص دویدن"
 *               imageUrl:
 *                 type: string
 *                 example: "https://example.com/adidas.png"
 *               discount:
 *                 type: number
 *                 example: 20
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: محصول با موفقیت آپدیت شد (آپدیت جزئی)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: شناسه یا ورودی نامعتبر / هیچ فیلدی ارسال نشده
 *       404:
 *         description: محصول پیدا نشد
 *       500:
 *         description: خطای سرور
 */

router.patch("/:id",authMiddleware, isAdmin , productController.patchProduct )
/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: حذف محصول (فقط ادمین)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []   # نیاز به توکن JWT دارد
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه محصولی که باید حذف شود
 *     responses:
 *       200:
 *         description: محصول با موفقیت حذف شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: شناسه نامعتبر است
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid product ID
 *       404:
 *         description: محصول پیدا نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
 *       500:
 *         description: خطای سرور
 */

// حذف محصول (ادمین)
router.delete("/:id",authMiddleware,isAdmin, productController.deleteProduct);


module.exports = router;
                    