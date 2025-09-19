const testController= require("./../controller/testController")
const authMiddleware = require("../middelware/authMiddelware")
const  isAdmin = require("./../middelware/isAdmin")
const express= require("express")

const router = express.Router()
/**
 * @swagger
 * /api/v1/tests:
 *   get:
 *     summary: دریافت همه تست‌ها
 *     tags:
 *       - Tests
 *     responses:
 *       200:
 *         description: لیست تست‌ها به همراه اطلاعات تکمیلی
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: "Test title"
 *                   imagepath:
 *                     type: string
 *                     example: "/images/test1.png"
 *                   shortDescription:
 *                     type: string
 *                     example: "توضیح کوتاه تست"
 *                   price:
 *                     type: number
 *                     example: 10000
 *                   target_audience:
 *                     type: string
 *                     example: "دانش‌آموزان"
 *                   category:
 *                     type: string
 *                     example: "ریاضی"
 *                   time:
 *                     type: number
 *                     example: 90 
 *                   question_count:
 *                     type: integer
 *                     example: 30
 *                   participantCount:
 *                     type: integer
 *                     example: 100
 *       500:
 *         description: خطا در دریافت تست‌ها
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "مشکلی در دریافت تست‌ها به وجود آمد."
 */

router.get("/",testController.getAll)
/**
 * @swagger
 * /api/v1/tests:
 *   post:
 *     summary: ایجاد یک تست جدید (فقط ادمین‌ها)
 *     tags:
 *       - Tests
 *     security:
 *       - bearerAuth: []   # فرض بر این که توکن JWT یا مشابه استفاده می‌کنی
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - time
 *               - date
 *               - mainDescription
 *               - ShortDescription
 *               - target_audience
 *               - price
 *               - category
 *               - suitableFor
 *             properties:
 *               title:
 *                 type: string
 *                 example: "آزمون ریاضی پایه دهم"
 *               time:
 *                 type: string
 *                 example: "90 دقیقه"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-01"
 *               mainDescription:
 *                 type: string
 *                 example: "توضیحات کامل آزمون"
 *               ShortDescription:
 *                 type: string
 *                 example: "توضیح کوتاه آزمون"
 *               target_audience:
 *                 type: string
 *                 example: "دانش‌آموزان پایه دهم"
 *               price:
 *                 type: number
 *                 example: 15000
 *               category:
 *                 type: string
 *                 example: "ریاضی"
 *               imagepath:
 *                 type: string
 *                 example: "/images/test10.png"
 *               suitableFor:
 *                 type: array
 *                 example: ["والدین","دانش‌آموزان کنکوری"]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["ریاضی", "پایه دهم"]
 *     responses:
 *       201:
 *         description: تست با موفقیت ایجاد شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "تست با موفقیت ایجاد شد"
 *                 test:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     title:
 *                       type: string
 *                       example: "آزمون ریاضی پایه دهم"
 *           
 *       400:
 *         description: خطا در ورودی (فیلدهای ضروری پر نشده)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "لطفاً تمام فیلدها را پر کنید."
 *       500:
 *         description: خطا در سرور هنگام ایجاد تست
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "مشکلی در ایجاد تست‌ها به وجود آمد."
 */
router.post("/", authMiddleware, isAdmin, testController.createTest);
/**
 * @swagger
 * /api/v1/tests/{id}:
 *   get:
 *     summary: دریافت جزئیات یک تست بر اساس شناسه
 *     tags:
 *       - Tests
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه تست
 *         example: 123
 *     responses:
 *       200:
 *         description: جزئیات تست به همراه تعداد سوالات، شرکت‌کنندگان و دسته‌بندی‌ها
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 123
 *                 title:
 *                   type: string
 *                   example: "آزمون ریاضی پایه دهم"
 *                 shortDescription:
 *                   type: string
 *                   example: "توضیح کوتاه آزمون"
 *                 mainDescription:
 *                   type: string
 *                   example: "توضیحات کامل آزمون"
 *                 imagePath:
 *                   type: string
 *                   example: "/images/test10.png"
 *                 participants:
 *                   type: integer
 *                   example: 100
 *                 target_audience:
 *                   type: string
 *                   example: "دانش‌آموزان پایه دهم"
 *                 price:
 *                   type: number
 *                   example: 15000
 *                 suitablefor:
 *                   type: string
 *                   example: ["دانش آموزان","والدین"] 
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["ریاضی", "پایه دهم"]
 *                 question_count:
 *                   type: integer
 *                   example: 30
 *                 categrys:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "دسته‌بندی ۱"
 *                 participantCount:
 *                   type: integer
 *                   example: 100
 *       404:
 *         description: تست مورد نظر پیدا نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "تست مورد نظر پیدا نشد."
 *       500:
 *         description: خطا در پیدا کردن تست
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "مشکلی در پیدا کردن تست به وجود آمده"
 */
router.get("/:id" ,testController.getTest)
/**
 * @swagger
 * /api/v1/tests/{id}:
 *   delete:
 *     summary: حذف یک تست (فقط برای ادمین‌ها)
 *     tags:
 *       - Tests
 *     security:
 *       - bearerAuth: []  # نیاز به توکن برای احراز هویت
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: شناسه‌ی تستی که باید حذف شود
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       200:
 *         description: تست با موفقیت حذف شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "تست با موفقیت حذف شد."
 *       404:
 *         description: تستی با این شناسه یافت نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "تستی با این شناسه یافت نشد."
 *       500:
 *         description: خطایی در حذف تست رخ داد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "خطایی در حذف تست رخ داد."
 */
router.delete("/:id", authMiddleware, isAdmin, testController.deleteTest);
/**
 * @swagger
 * /api/v1/tests/{id}/questions:
 *   post:
 *     summary: افزودن سوال جدید به یک تست خاص (فقط ادمین‌ها)
 *     tags:
 *       - Tests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه تستی که سوال به آن اضافه می‌شود
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - items
 *               - correctIndex
 *             properties:
 *               title:
 *                 type: string
 *                 example: "کدام گزینه درست است؟"
 *               items:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["گزینه اول", "گزینه دوم", "گزینه سوم", "گزینه چهارم"]
 *               correctIndex:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: سوال با موفقیت اضافه شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "سوال با موفقیت ثبت شد"
 *                 question:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 55
 *                     examId:
 *                       type: integer
 *                       example: 123
 *                     title:
 *                       type: string
 *                       example: "کدام گزینه درست است؟"
 *                 options:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: integer
 *                       example: 55
 *                     items:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["گزینه اول", "گزینه دوم", "گزینه سوم", "گزینه چهارم"]
 *                     correctIndex:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: اطلاعات ناقص یا اندیس نامعتبر
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "اطلاعات ناقص است"
 *       401:
 *         description: خطا در ثبت سوال یا گزینه‌ها
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "سوال ثبت نشد لطفا دوباره امتحان کنید"
 *       500:
 *         description: خطای داخلی سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "خطا در سرور برای ساخت سوال"
 */
router.post("/:id/questions", authMiddleware, isAdmin, testController.createTestQuestion);
/**
 * @swagger
 * /api/v1/tests/{id}/questions:
 *   get:
 *     summary: دریافت تمام سوالات یک آزمون همراه با گزینه‌ها (فقط برای کاربران لاگین‌شده)
 *     tags:
 *       - Tests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: شناسه آزمون
 *     responses:
 *       200:
 *         description: لیست سوالات به همراه گزینه‌ها
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             items:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             correctIndex:
 *                               type: integer
 *       401:
 *         description: کاربر احراز هویت نشده است
 *       500:
 *         description: خطای داخلی سرور
 */

router.get("/:id/questions",authMiddleware,testController.showQuestion)
/**
 * @swagger
 * /api/v1/tests/{id}/questions/{questionId}:
 *   put:
 *     summary: ویرایش سوال موجود (فقط ادمین‌ها)
 *     tags:
 *       - Tests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه تست
 *         example: 123
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه سوال
 *         example: 55
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - items
 *               - correctIndex
 *             properties:
 *               title:
 *                 type: string
 *                 example: "سوال ویرایش شده"
 *               items:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["گزینه اول", "گزینه دوم", "گزینه سوم", "گزینه چهارم"]
 *               correctIndex:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: سوال با موفقیت به‌روزرسانی شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "سوال با موفقیت به‌روزرسانی شد"
 *                 question:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 55
 *                     title:
 *                       type: string
 *                       example: "سوال ویرایش شده"
 *       400:
 *         description: اطلاعات ناقص یا نامعتبر
 *       404:
 *         description: سوال مورد نظر پیدا نشد
 *       500:
 *         description: خطای داخلی سرور
 */
router.put("/:id/questions/:questionId", authMiddleware, isAdmin, testController.updateQuestion);
/**
 * @swagger
 * /api/v1/tests/{id}/questions/{questionId}:
 *   delete:
 *     summary: حذف سوال (فقط ادمین‌ها)
 *     tags:
 *       - Tests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه تست
 *         example: 123
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه سوال
 *         example: 55
 *     responses:
 *       200:
 *         description: سوال با موفقیت حذف شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "سوال با موفقیت حذف شد"
 *       404:
 *         description: سوال مورد نظر پیدا نشد
 *       500:
 *         description: خطای داخلی سرور
 */
router.delete("/:id/questions/:questionId", authMiddleware, isAdmin, testController.deleteQuestion);
/**
 * @swagger
 * /api/v1/tests/{id}/submit:
 *   post:
 *     summary: ارسال پاسخ‌های آزمون (فقط کاربران لاگین‌شده)
 *     tags:
 *       - Tests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه آزمون
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["گزینه اول", "گزینه دوم", "گزینه سوم"]
 *               userId:
 *                 type: integer
 *                 example: 456
 *     responses:
 *       200:
 *         description: آزمون با موفقیت ثبت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "آزمون با موفقیت ثبت شد"
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 789
 *                     score:
 *                       type: integer
 *                       example: 85
 *                     correctAnswers:
 *                       type: integer
 *                       example: 17
 *                     totalQuestions:
 *                       type: integer
 *                       example: 20
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: اطلاعات ناقص یا نامعتبر
 *       404:
 *         description: آزمون مورد نظر پیدا نشد
 *       500:
 *         description: خطای داخلی سرور
 */
router.post("/:id/submit", authMiddleware, testController.submitExam);
/**
 * @swagger
 * /api/v1/tests/{id}/result:
 *   get:
 *     summary: دریافت نتیجه آزمون کاربر (فقط کاربران لاگین‌شده)
 *     tags:
 *       - Tests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه آزمون
 *         example: 123
 *     responses:
 *       200:
 *         description: نتیجه آزمون
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 789
 *                     score:
 *                       type: integer
 *                       example: 85
 *                     answers:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["گزینه اول", "گزینه دوم", "گزینه سوم"]
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: نتیجه آزمون یافت نشد
 *       500:
 *         description: خطای داخلی سرور
 */
router.get("/:id/result", authMiddleware, testController.getExamResult);


//router.patch("/rate/test/:id", testController.addrate)



module.exports = router