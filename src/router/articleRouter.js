const articleController = require("../controller/articleController");
const authMiddleware = require("../middelware/authMiddelware");
const isAdmin = require("../middelware/isAdmin");
const express = require("express");

const router = express.Router();

/**
 * @swagger
 * /api/v1/articles:
 *   get:
 *     summary: دریافت لیست مقالات
 *     tags:
 *       - Articles
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: شماره صفحه
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: تعداد مقالات در هر صفحه
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: فیلتر بر اساس دسته‌بندی
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: جستجو در عنوان و خلاصه
 *     responses:
 *       200:
 *         description: لیست مقالات
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 articles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "عنوان مقاله"
 *                       excerpt_description:
 *                         type: string
 *                         example: "خلاصه مقاله"
 *                       category:
 *                         type: string
 *                         example: "روانشناسی"
 *                       readingTime:
 *                         type: integer
 *                         example: 5
 *                       author:
 *                         type: string
 *                         example: "نوین کد"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *       500:
 *         description: خطا در دریافت مقالات
 */
router.get("/", articleController.getAllArticles);

/**
 * @swagger
 * /api/v1/articles/search:
 *   get:
 *     summary: جستجوی مقالات
 *     tags:
 *       - Articles
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: عبارت جستجو
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: فیلتر دسته‌بندی
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: تعداد نتایج
 *     responses:
 *       200:
 *         description: نتایج جستجو
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   excerpt_description:
 *                     type: string
 *                   category:
 *                     type: string
 *       500:
 *         description: خطا در جستجو
 */
router.get("/search", articleController.searchArticles);

/**
 * @swagger
 * /api/v1/articles/{id}:
 *   get:
 *     summary: دریافت مقاله بر اساس ID
 *     tags:
 *       - Articles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه مقاله
 *         example: 1
 *     responses:
 *       200:
 *         description: جزئیات مقاله
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: "عنوان مقاله"
 *                 excerpt_description:
 *                   type: string
 *                   example: "خلاصه مقاله"
 *                 description:
 *                   type: string
 *                   example: "توضیحات کامل مقاله"
 *                 contentSections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "heading"
 *                       level:
 *                         type: integer
 *                         example: 2
 *                       text:
 *                         type: string
 *                         example: "عنوان بخش"
 *                 faq:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       question:
 *                         type: string
 *                       answer:
 *                         type: string
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       comment:
 *                         type: string
 *                       likes:
 *                         type: integer
 *       404:
 *         description: مقاله یافت نشد
 *       500:
 *         description: خطا در دریافت مقاله
 */
router.get("/:id", articleController.getArticleById);

// ========== Admin Routes ==========

/**
 * @swagger
 * /api/v1/admin/articles:
 *   get:
 *     summary: دریافت لیست مقالات برای ادمین
 *     tags:
 *       - Admin Articles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: لیست مقالات با اطلاعات کامل
 *       401:
 *         description: عدم احراز هویت
 *       403:
 *         description: عدم دسترسی ادمین
 *       500:
 *         description: خطا در دریافت مقالات
 */
router.get("/admin/articles", authMiddleware, isAdmin, articleController.getAllArticles);

/**
 * @swagger
 * /api/v1/admin/articles:
 *   post:
 *     summary: ایجاد مقاله جدید (فقط ادمین)
 *     tags:
 *       - Admin Articles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - excerpt
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: "عنوان مقاله"
 *               excerpt:
 *                 type: string
 *                 example: "خلاصه مقاله"
 *               description:
 *                 type: string
 *                 example: "توضیحات کامل مقاله"
 *               author:
 *                 type: string
 *                 example: "نوین کد"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-01"
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               readingTime:
 *                 type: integer
 *                 example: 5
 *               category:
 *                 type: string
 *                 example: "روانشناسی"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["برچسب1", "برچسب2"]
 *               contentSections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: ["heading", "text", "image", "list", "blockquote", "video"]
 *                     level:
 *                       type: integer
 *                       description: "برای نوع heading"
 *                     text:
 *                       type: string
 *                       description: "برای انواع heading, text, blockquote"
 *                     src:
 *                       type: string
 *                       description: "برای انواع image, video"
 *                     alt:
 *                       type: string
 *                       description: "برای نوع image"
 *                     caption:
 *                       type: string
 *                       description: "برای انواع image, video"
 *                     ordered:
 *                       type: boolean
 *                       description: "برای نوع list"
 *                     items:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: "برای نوع list"
 *                     author:
 *                       type: string
 *                       description: "برای نوع blockquote"
 *               faqs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                     answer:
 *                       type: string
 *               reviews:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     comment:
 *                       type: string
 *                     likes:
 *                       type: integer
 *                     dislikes:
 *                       type: integer
 *     responses:
 *       201:
 *         description: مقاله با موفقیت ایجاد شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "مقاله با موفقیت ایجاد شد"
 *                 article:
 *                   type: object
 *       400:
 *         description: اطلاعات ناقص
 *       401:
 *         description: عدم احراز هویت
 *       403:
 *         description: عدم دسترسی ادمین
 *       500:
 *         description: خطا در ایجاد مقاله
 */
router.post("/admin/articles", authMiddleware, isAdmin, articleController.createArticle);

/**
 * @swagger
 * /api/v1/admin/articles/{id}:
 *   get:
 *     summary: دریافت مقاله برای ویرایش (فقط ادمین)
 *     tags:
 *       - Admin Articles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه مقاله
 *     responses:
 *       200:
 *         description: جزئیات مقاله
 *       401:
 *         description: عدم احراز هویت
 *       403:
 *         description: عدم دسترسی ادمین
 *       404:
 *         description: مقاله یافت نشد
 *       500:
 *         description: خطا در دریافت مقاله
 */
router.get("/admin/articles/:id", authMiddleware, isAdmin, articleController.getArticleById);

/**
 * @swagger
 * /api/v1/admin/articles/{id}:
 *   put:
 *     summary: ویرایش مقاله (فقط ادمین)
 *     tags:
 *       - Admin Articles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه مقاله
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               description:
 *                 type: string
 *               author:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               image:
 *                 type: string
 *               readingTime:
 *                 type: integer
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               contentSections:
 *                 type: array
 *                 items:
 *                   type: object
 *               faqs:
 *                 type: array
 *                 items:
 *                   type: object
 *               reviews:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: مقاله با موفقیت به‌روزرسانی شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "مقاله با موفقیت به‌روزرسانی شد"
 *                 article:
 *                   type: object
 *       400:
 *         description: اطلاعات ناقص
 *       401:
 *         description: عدم احراز هویت
 *       403:
 *         description: عدم دسترسی ادمین
 *       404:
 *         description: مقاله یافت نشد
 *       500:
 *         description: خطا در به‌روزرسانی مقاله
 */
router.put("/admin/articles/:id", authMiddleware, isAdmin, articleController.updateArticle);

/**
 * @swagger
 * /api/v1/admin/articles/{id}:
 *   delete:
 *     summary: حذف مقاله (فقط ادمین)
 *     tags:
 *       - Admin Articles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه مقاله
 *     responses:
 *       200:
 *         description: مقاله با موفقیت حذف شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "مقاله با موفقیت حذف شد"
 *       401:
 *         description: عدم احراز هویت
 *       403:
 *         description: عدم دسترسی ادمین
 *       404:
 *         description: مقاله یافت نشد
 *       500:
 *         description: خطا در حذف مقاله
 */
router.delete("/admin/articles/:id", authMiddleware, isAdmin, articleController.deleteArticle);

/**
 * @swagger
 * /api/v1/admin/articles/stats:
 *   get:
 *     summary: دریافت آمار مقالات (فقط ادمین)
 *     tags:
 *       - Admin Articles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: آمار مقالات
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 published:
 *                   type: integer
 *                   example: 20
 *                 draft:
 *                   type: integer
 *                   example: 5
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       count:
 *                         type: integer
 *       401:
 *         description: عدم احراز هویت
 *       403:
 *         description: عدم دسترسی ادمین
 *       500:
 *         description: خطا در دریافت آمار
 */
router.get("/admin/articles/stats", authMiddleware, isAdmin, articleController.getArticleStats);

/**
 * @swagger
 * /api/v1/admin/articles/recent:
 *   get:
 *     summary: دریافت مقالات اخیر (فقط ادمین)
 *     tags:
 *       - Admin Articles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: تعداد مقالات اخیر
 *     responses:
 *       200:
 *         description: مقالات اخیر
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   category:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   author:
 *                     type: string
 *       401:
 *         description: عدم احراز هویت
 *       403:
 *         description: عدم دسترسی ادمین
 *       500:
 *         description: خطا در دریافت مقالات اخیر
 */
router.get("/admin/articles/recent", authMiddleware, isAdmin, articleController.getRecentArticles);

module.exports = router;
