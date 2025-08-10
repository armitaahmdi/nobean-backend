const  express = require("express")
const authMiddleware = require("../middelware/authMiddelware")
const  isAdmin = require("./../middelware/isAdmin")
const  podcastController = require("./../controller/podcastController")
const  {validatPodcast} = require("./../utils/validat/podcast")
const  router = express.Router()
/**
 * @swagger
 * /api/v1/podcasts/:
 *   post:
 *     summary: ایجاد یک پادکست جدید
 *     tags:
 *       - Podcasts
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
 *               - excerpt_description
 *               - description
 *               - audioUrl
 *               - image
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *                 example: "سفر به اعماق ذهن"
 *               excerpt_description:
 *                 type: string
 *                 example: "گفتگو با دکتر روانشناس درباره ذهن ناخودآگاه"
 *               description:
 *                 type: string
 *                 example: "در این پادکست با دکتر نادری درباره موضوعات روانشناسی و ذهن صحبت می‌کنیم."
 *               audioUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/audio/episode1.mp3"
 *               image:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/images/episode1.jpg"
 *               guest:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["دکتر نادری", "مهندس رضایی"]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["روانشناسی", "ذهن", "مصاحبه"]
 *               duration:
 *                 type: integer
 *                 example: 42
 *     responses:
 *       201:
 *         description: پادکست با موفقیت ایجاد شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "پادکست باموفقیت ایجاد شد"
 *                 data:
 *                   $ref: '#/components/schemas/Podcast'
 *       401:
 *         description: عنوان تکراری
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "این تایتل برای یک پادکست دیگه ای انتخاب شده"
 *       403:
 *         description: پادکست تکراری
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "این پادکست قبلا آپلود شده"
 *       400:
 *         description: خطای اعتبارسنجی اطلاعات ورودی
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "وجود نام پادکست الزامی است"
 *                       path:
 *                         type: string
 *                         example: "title"
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "خطا در سرور رخ داد"
 */

router.post("/" ,authMiddleware , isAdmin , validatPodcast,podcastController.createPodcast)
/**
 * @swagger
 * /api/v1/podcasts/:
 *   get:
 *     summary: دریافت تمام پادکست‌ها
 *     tags:
 *       - Podcasts
 *     responses:
 *       200:
 *         description: لیست پادکست‌ها با موفقیت دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: پادکست های دریافتی
 *                 podcasts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: چگونه موفق شویم؟
 *                       image:
 *                         type: string
 *                         format: uri
 *                         example: https://example.com/image.jpg
 *                       audioUrl:
 *                         type: string
 *                         format: uri
 *                         example: https://example.com/audio.mp3
 *                       guest:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["دکتر نادری"]
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["توسعه فردی", "انگیزشی"]
 *                       publishDate:
 *                         type: string
 *                         format: date
 *                         example: 2025-08-01
 *       404:
 *         description: پادکستی یافت نشد
 *       500:
 *         description: خطای سرور
 */

router.get ("/" , podcastController.getAll)
/**
 * @swagger
 * /api/v1/podcasts/{id}:
 *   get:
 *     summary: دریافت یک پادکست با شناسه
 *     tags:
 *       - Podcasts
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: شناسه پادکست
 *     responses:
 *       200:
 *         description: اطلاعات پادکست با موفقیت بازیابی شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: پادکست پیدا شد
 *                 findPodcast:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     excerpt_description:
 *                       type: string
 *                     description:
 *                       type: string
 *                     audioUrl:
 *                       type: string
 *                     image:
 *                       type: string
 *                     guest:
 *                       type: array
 *                       items:
 *                         type: string
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                     duration:
 *                       type: string
 *                     publishDate:
 *                       type: string
 *       404:
 *         description: پادکست یافت نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: این پادکست وجود نداره
 *       500:
 *         description: خطا در سرور
 */

router.get("/:id" , podcastController.getOne)
/**
 * @swagger
 * /api/v1/podcasts/{id}:
 *   delete:
 *     summary: حذف یک پادکست بر اساس آی‌دی
 *     tags: [Podcasts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: آی‌دی پادکست مورد نظر
 *     responses:
 *       200:
 *         description: پادکست با موفقیت حذف شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: integer
 *       400:
 *         description: آی‌دی نامعتبر است
 *       404:
 *         description: پادکست پیدا نشد
 *       500:
 *         description: خطای داخلی سرور
 */

router.delete("/:id" ,authMiddleware , isAdmin  , podcastController.delete)
/**
 * @swagger
 * /api/v1/podcasts/{id}:
 *   patch:
 *     summary: ویرایش اطلاعات یک پادکست
 *     tags:
 *       - Podcasts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه پادکست
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *               audioUrl:
 *                 type: string
 *               guest:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["دکتر نادری", "مهندس رفیعی"]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               publishDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: پادکست با موفقیت ویرایش شد
 *       400:
 *         description: خطای اعتبارسنجی یا آیدی نامعتبر
 *       404:
 *         description: پادکست یافت نشد
 *       500:
 *         description: خطای سرور
 */

router.patch("/:id" ,authMiddleware , isAdmin  , podcastController.edite)




module.exports = router 


