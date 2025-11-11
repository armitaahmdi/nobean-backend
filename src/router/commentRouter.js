const express = require('express');
const router = express.Router()
const isAdmin = require("../middelware/isAdmin")
const authMiddleware = require("../middelware/authMiddelware");
const optionalAuthMiddleware = require("../middelware/optionalAuthMiddelware");
const CommentController = require('../controller/commentController'); // مسیر به controller
/**
 * @swagger
 * /api/v1/comments/:
 *   get:
 *     summary: دریافت کامنت‌ها و ریپلای‌ها برای یک سکشن مشخص
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: query
 *         name: section_type
 *         schema:
 *           type: string
 *           enum: [course, test, lesson, product, podcast]
 *         required: true
 *         example: course
 *       - in: query
 *         name: section_id
 *         schema:
 *           type: integer
 *         required: true
 *         example: 1
 *     responses:
 *       200:
 *         description: لیست کامنت‌ها و ریپلای‌ها
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   text:
 *                     type: string
 *                   section_type:
 *                     type: string
 *                   section_id:
 *                     type: integer
 *                   idx:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   Replies:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         user_id:
 *                           type: integer
 *                         text:
 *                           type: string
 *                         parent_comment_id:
 *                           type: integer
 *                         section_type:
 *                           type: string
 *                         section_id:
 *                           type: integer
 *                         idx:
 *                           type: integer
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: section_type یا section_id ارائه نشده
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "section_type و section_id الزامی هستند"
 *       404:
 *         description: هیچ کامنتی برای سکشن موردنظر وجود ندارد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "هیچ کامنتی وجود ندارد"
 *       500:
 *         description: خطای داخلی سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "خطای داخلی سرور"
 */

router.get("/", optionalAuthMiddleware, CommentController.getCommentsBySection);

/**
 * @swagger
 * /api/v1/comments/{id}/replies:
 *   get:
 *     summary: دریافت ریپلای‌های یک کامنت مشخص
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه کامنت والد
 *         example: 10
 *       - in: query
 *         name: section_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [course,test, lesson, product, podcast]
 *         description: نوع سکشن
 *         example: course
 *       - in: query
 *         name: section_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه سکشن
 *         example: 1
 *     responses:
 *       200:
 *         description: لیست ریپلای‌ها
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   text:
 *                     type: string
 *                   parent_comment_id:
 *                     type: integer
 *                   section_type:
 *                     type: string
 *                   section_id:
 *                     type: integer
 *                   idx:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: شناسه یا پارامترهای query نامعتبر
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "id یا پارامترهای section_type و section_id نامعتبر هستند"
 *       404:
 *         description: هیچ ریپلای‌ای برای کامنت وجود ندارد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "هیچ ریپلای‌ای برای این کامنت وجود ندارد"
 *       500:
 *         description: خطای داخلی سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "خطای داخلی سرور"
 */

// گرفتن ریپلای‌های یک کامنت
// مثال: GET /api/v1/comments/10/replies?section_type=course&section_id=1
router.get("/:id/replies", CommentController.getRepliesByComment);
/**
 * @swagger
 * /api/v1/comments:
 *   post:
 *     summary: ایجاد یک کامنت جدید یا ریپلای
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - section_type
 *               - section_id
 *             properties:
 *               text:
 *                 type: string
 *                 description: متن کامنت
 *                 example: "این یک کامنت تستی است"
 *               section_type:
 *                 type: string
 *                 description: نوع سکشن
 *                 enum: [course, test, product, podcast]
 *                 example: "course"
 *               section_id:
 *                 type: integer
 *                 description: شناسه سکشن
 *                 example: 1
 *               parent_comment_id:
 *                 type: integer
 *                 description: اگر ریپلای است، شناسه کامنت والد
 *                 nullable: true
 *                 example: 5
 *     responses:
 *       201:
 *         description: کامنت با موفقیت ایجاد شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 text:
 *                   type: string
 *                 parent_comment_id:
 *                   type: integer
 *                   nullable: true
 *                 section_type:
 *                   type: string
 *                 section_id:
 *                   type: integer
 *                 idx:
 *                   type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: پارامترهای الزامی ارسال نشده یا parent_comment_id معتبر نیست
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "text, section_type و section_id الزامی هستند"
 *       401:
 *         description: کاربر احراز هویت نشده
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "کاربر احراز هویت نشده است"
 *       500:
 *         description: خطای داخلی سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "خطایی در سرور رخ داد"
 *                 detail:
 *                   type: string
 */

// ایجاد کامنت جدید (کاربر لاگین شده)
router.post("/", authMiddleware, CommentController.createComment);
/**
 * @swagger
 * /api/v1/comments/{id}:
 *   put:
 *     summary: ویرایش یک کامنت توسط کاربر خودش
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []   # authMiddleware
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه کامنتی که کاربر می‌خواهد ویرایش کند
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: متن جدید کامنت
 *                 example: "متن ویرایش شده کامنت"
 *     responses:
 *       200:
 *         description: کامنت با موفقیت ویرایش شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "کامنت با موفقیت ویرایش شد"
 *                 comment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     user_id:
 *                       type: integer
 *                     text:
 *                       type: string
 *                     parent_comment_id:
 *                       type: integer
 *                       nullable: true
 *                     section_type:
 *                       type: string
 *                     section_id:
 *                       type: integer
 *                     idx:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: متن کامنت خالی است
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "متن کامنت نمی‌تواند خالی باشد"
 *       401:
 *         description: کاربر احراز هویت نشده
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "احراز هویت نامعتبر است"
 *       403:
 *         description: کاربر اجازه ویرایش ندارد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "شما اجازه ویرایش این کامنت را ندارید"
 *       404:
 *         description: کامنت پیدا نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "کامنت پیدا نشد"
 *       500:
 *         description: خطای داخلی سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "خطای داخلی سرور"
 *                 details:
 *                   type: string
 */

// ویرایش کامنت (کاربر خودش)
router.put("/:id", authMiddleware, CommentController.updateComment);
/**
 * @swagger
 * /api/v1/comments/{id}:
 *   delete:
 *     summary: حذف یک کامنت و ریپلای‌های آن
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []   # authMiddleware
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه کامنتی که می‌خواهید حذف کنید
 *         example: 1
 *     responses:
 *       200:
 *         description: کامنت و ریپلای‌های مربوطه با موفقیت حذف شدند
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "کامنت و ریپلای‌های مربوطه با موفقیت حذف شدند"
 *       400:
 *         description: شناسه نامعتبر
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "شناسه کامنت نامعتبر است"
 *       401:
 *         description: کاربر احراز هویت نشده
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "احراز هویت نامعتبر است"
 *       403:
 *         description: کاربر اجازه حذف ندارد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "شما اجازه حذف این کامنت را ندارید"
 *       404:
 *         description: کامنت پیدا نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "کامنت پیدا نشد"
 *       500:
 *         description: خطای داخلی سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "خطای داخلی سرور"
 *                 details:
 *                   type: string
 */

// حذف کامنت (  ادمین)
router.delete("/:id", authMiddleware, isAdmin,CommentController.deleteComment);

// like/dislike (toggle)
router.post('/:id/like', authMiddleware, (req, res, next) => {
  req.body.type = 'like';
  return CommentController.reactToComment(req, res, next);
});
router.post('/:id/dislike', authMiddleware, (req, res, next) => {
  req.body.type = 'dislike';
  return CommentController.reactToComment(req, res, next);
});

// report
router.post('/:id/report', authMiddleware, CommentController.reportComment);

// دریافت کامنت‌های جدید برای ادمین
router.get('/admin/recent', authMiddleware, isAdmin, CommentController.getRecentComments);

// تایید یا رد کامنت (برای ادمین)
router.post('/:id/moderate', authMiddleware, isAdmin, CommentController.moderateComment);

module.exports = router;

