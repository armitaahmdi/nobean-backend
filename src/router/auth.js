const express = require("express")
const authController = require("../controller/authController")
const authMiddleware = require("../middelware/authMiddelware")
const  isAdmin = require("./../middelware/isAdmin")
const  {validatComplitProfile} = require("./../utils/validat/userProfile")
const router = express.Router()
/**
 * @swagger
 * /sms/sendCode:
 *   post:
 *     summary: ارسال کد تایید (OTP) به شماره موبایل
 *     tags: [Auth]
 *     requestBody:
 *       description: شماره موبایل برای ارسال کد تایید
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "09123456789"
 *     responses:
 *       200:
 *         description: کد تایید با موفقیت ارسال شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP code sent successfully"
 *       500:
 *         description: خطا در ارسال کد تایید
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "خطا در ارسال کد تایید"
 */

router.post("/sendOtp" , authController.sendOtp)
/**
 * @swagger
 * /verify-otp:
 *   post:
 *     summary: تایید کد OTP و دریافت توکن دسترسی
 *     tags: [Auth]
 *     requestBody:
 *       description: ارسال کد تایید و شماره موبایل برای احراز هویت
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - phone
 *             properties:
 *               code:
 *                 type: string
 *                 example: "12345"
 *               phone:
 *                 type: string
 *                 example: "09123456789"
 *     responses:
 *       200:
 *         description: کد تایید موفقیت‌آمیز بود و توکن ارسال شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 message:
 *                   type: string
 *                   example: "OTP verified successfully"
 *       401:
 *         description: اطلاعات ناقص یا کد/شماره اشتباه است
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "کد یا شماره اشتباه است."
 */

router.post("/verifyOtp" , authController.verifyOtp)
/**
 * @swagger
 * /complit-profile:
 *   post:
 *     summary: تکمیل پروفایل کاربر (نیاز به احراز هویت)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: اطلاعات کامل پروفایل کاربر و اطلاعات مربوط به والدین (در صورت وجود)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "حسین"
 *               lastName:
 *                 type: string
 *                 example: "بخشی"
 *               userName:
 *                 type: string
 *                 example: "hosseinbakhshi"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               copassword:
 *                 type: string
 *                 example: "123456"
 *               email:
 *                 type: string
 *                 example: "hossein@example.com"
 *               age:
 *                 type: integer
 *                 example: 25
 *               isParent:
 *                 type: boolean
 *                 example: true
 *               childPhone:
 *                 type: string
 *                 example: "09121234567"
 *               isFather:
 *                 type: boolean
 *                 example: true
 *             required:
 *               - firstName
 *               - lastName
 *               - userName
 *               - password
 *               - copassword
 *               - email
 *               - age
 *               - isParent
 *     responses:
 *       200:
 *         description: پروفایل با موفقیت تکمیل شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "پروفایل با موفقیت تکمیل شد"
 *       400:
 *         description: آپدیت انجام نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "آپدیت انجام نشد"
 *       404:
 *         description: کاربری با شماره داده شده یافت نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "کاربری با این شماره یافت نشد"
 *       500:
 *         description: خطا در سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "خطا در سرور"
 */

router.post("/complit-profile",authMiddleware,validatComplitProfile  ,authController.compitProfile)
router.patch("/profile",authMiddleware,authController.editProfile)

module.exports = router