const testController= require("./../controller/testController")
const authMiddleware = require("../middelware/authMiddelware")
const  isAdmin = require("./../middelware/isAdmin")
const express= require("express")

const router = express.Router()


/**
 * @swagger
 * /test:
 *   get:
 *     summary: دریافت لیست 100 آزمون آخر
 *     tags: [Test]
 *     description: این API لیست 100 آزمون آخر ایجاد شده را همراه با تعداد سوالات هر آزمون بازمی‌گرداند.
 *     responses:
 *       200:
 *         description: لیست آزمون‌ها با موفقیت دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "123"
 *                   title:
 *                     type: string
 *                     example: "آزمون ریاضی پایه نهم"
 *                   imagepath:
 *                     type: string
 *                     example: "/uploads/images/math.jpg"
 *                   shortDescription:
 *                     type: string
 *                     example: "آزمونی برای مرور مفاهیم پایه‌ای ریاضی"
 *                   price:
 *                     type: number
 *                     example: 29000
 *                   target_audience:
 *                     type: string
 *                     example: "دانش‌آموزان پایه نهم"
 *                   category:
 *                     type: string
 *                     example: "ریاضی"
 *                   question_count:
 *                     type: number
 *                     example: 25
 *       500:
 *         description: خطا در سرور هنگام دریافت آزمون‌ها
 */

router.get("/",testController.getAll)
/**
 * @swagger
 * /test/createtest:
 *   post:
 *     summary: ایجاد آزمون جدید (فقط برای ادمین‌ها)
 *     tags: [Test]
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
 *                 example: "آزمون فیزیک پیشرفته"
 *               time:
 *                 type: number
 *                 example: 60
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-01"
 *               mainDescription:
 *                 type: string
 *                 example: "این آزمون شامل سوالات مفهومی و محاسباتی فیزیک است."
 *               ShortDescription:
 *                 type: string
 *                 example: "آزمون برای دانش‌آموزان کنکوری"
 *               target_audience:
 *                 type: string
 *                 example: "پایه دوازدهم"
 *               price:
 *                 type: number
 *                 example: 45000
 *               category:
 *                 type: string
 *                 example: "فیزیک"
 *               imagepath:
 *                 type: string
 *                 example: "/uploads/images/physics.jpg"
 *               suitableFor:
 *                 type: string
 *                 example: "کنکور تجربی"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["فیزیک", "مفهومی", "تست زمان‌دار"]
 *     responses:
 *       201:
 *         description: آزمون با موفقیت ایجاد شد
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
 *                   description: اطلاعات آزمون ایجاد شده
 *       400:
 *         description: فیلدهای ضروری ناقص هستند
 *       401:
 *         description: عدم احراز هویت
 *       403:
 *         description: فقط ادمین‌ها مجاز به ایجاد آزمون هستند
 *       500:
 *         description: خطای سرور هنگام ایجاد آزمون
 */

router.post("/" ,authMiddleware,isAdmin, testController.createTest)
/**
 * @swagger
 * /test/{id}:
 *   get:
 *     summary: دریافت اطلاعات یک آزمون با آیدی
 *     tags: [Test]
 *     description: این API اطلاعات کامل یک آزمون خاص را همراه با تعداد سوالات و دسته‌بندی‌ها بازمی‌گرداند.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: آیدی آزمون مورد نظر
 *         schema:
 *           type: string
 *           example: "a1b2c3d4"
 *     responses:
 *       200:
 *         description: اطلاعات آزمون با موفقیت دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "a1b2c3d4"
 *                 title:
 *                   type: string
 *                   example: "آزمون زیست پایه یازدهم"
 *                 shortDescription:
 *                   type: string
 *                   example: "مروری بر مباحث مهم فصل 3"
 *                 mainDescription:
 *                   type: string
 *                   example: "این آزمون شامل سوالات مفهومی زیست‌شناسی می‌باشد."
 *                 imagePath:
 *                   type: string
 *                   example: "/uploads/images/biology.jpg"
 *                 participants:
 *                   type: number
 *                   example: 125
 *                 target_audience:
 *                   type: string
 *                   example: "دانش‌آموزان یازدهم"
 *                 price:
 *                   type: number
 *                   example: 39000
 *                 suitablefor:
 *                   type: string
 *                   example: "دانش‌آموزان مدارس خاص"
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["زیست", "فصل3", "تجربی"]
 *                 question_count:
 *                   type: number
 *                   example: 20
 *                 categrys:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   example:
 *                     - id: "cat1"
 *                       name: "زیست"
 *                     - id: "cat2"
 *                       name: "تجربی"
 *       404:
 *         description: تست پیدا نشد
 *       500:
 *         description: خطا در سرور
 */

router.get("/:id" ,testController.getTest)
/**
 * @swagger
 * /api/tests/{id}:
 *   delete:
 *     summary: حذف یک تست با شناسه مشخص
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه تست برای حذف
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
 *                   example: تست با موفقیت حذف شد.
 *       404:
 *         description: تستی با این شناسه یافت نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تستی با این شناسه یافت نشد.
 *       500:
 *         description: خطایی در حذف تست رخ داد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: خطایی در حذف تست رخ داد.
 */

router.delete("/:id",authMiddleware,isAdmin,testController.deleteTest )
/**
 * @swagger
 * /test/create-test/{id}:
 *   post:
 *     summary: افزودن سوال جدید به آزمون (فقط ادمین)
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: شناسه آزمونی که سوال به آن اضافه می‌شود
 *         schema:
 *           type: string
 *           example: "123abc"
 *     requestBody:
 *       description: اطلاعات سوال جدید شامل عنوان، گزینه‌ها و اندیس پاسخ صحیح
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
 *                 example: "کدام گزینه صحیح است؟"
 *               items:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["گزینه اول", "گزینه دوم", "گزینه سوم", "گزینه چهارم"]
 *               correctIndex:
 *                 type: integer
 *                 description: اندیس گزینه صحیح در آرایه items (شروع از صفر)
 *                 example: 2
 *     responses:
 *       200:
 *         description: سوال با موفقیت ایجاد شد
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
 *                   description: سوال ایجاد شده
 *                 options:
 *                   type: object
 *                   description: گزینه‌ها و پاسخ صحیح
 *       400:
 *         description: اطلاعات ناقص یا نادرست ارسال شده
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "اطلاعات ناقص است"
 *       401:
 *         description: عدم احراز هویت یا ثبت سوال/گزینه ناموفق
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "سوال ثبت نشد لطفا دوباره امتحان کنید"
 *       500:
 *         description: خطای سرور هنگام ثبت سوال
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "خطا در سرور برای ساخت سوال"
 */

router.post("/:id/question",authMiddleware,isAdmin,testController.createTestQuestion)
/**
 * @swagger
 * /test/show-question/{id}:
 *   get:
 *     summary: نمایش سوالات و گزینه‌های یک آزمون (نیاز به احراز هویت)
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: شناسه آزمون برای دریافت سوالات
 *         schema:
 *           type: string
 *           example: "123abc"
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
 *                         type: string
 *                         example: "q1"
 *                       title:
 *                         type: string
 *                         example: "این سوال درباره چی هست؟"
 *                       examId:
 *                         type: string
 *                         example: "123abc"
 *                       Items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "item1"
 *                             questionId:
 *                               type: string
 *                               example: "q1"
 *                             items:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["گزینه اول", "گزینه دوم", "گزینه سوم"]
 *                             correctIndex:
 *                               type: integer
 *                               example: 1
 *       401:
 *         description: عدم احراز هویت
 *       500:
 *         description: خطای سرور هنگام دریافت سوالات
 */

router.get("/:id/question",authMiddleware,testController.showQuestion)
//router.patch("/rate/test/:id", testController.addrate)



module.exports = router