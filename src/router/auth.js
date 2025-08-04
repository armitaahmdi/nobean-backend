const express = require("express")
const authController = require("../controller/authController")
const authMiddleware = require("../middelware/authMiddelware")
const  isAdmin = require("./../middelware/isAdmin")
const  {validatComplitProfile} = require("./../utils/validat/userProfile")
const router = express.Router()
/**
 * @swagger
 * /api/v1/users/send-otp:
 *   post:
 *     summary: ارسال کد تایید (OTP) به شماره موبایل کاربر
 *     tags:
 *       - Auth
 *     requestBody:
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
 *                 description: شماره موبایل کاربر برای ارسال کد تایید
 *                 example: "09121234567"
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
router.post("/send-otp" , authController.sendOtp)
/**
 * @swagger
 * /api/v1/users/verify-otp:
 *   post:
 *     summary: تایید کد OTP و ورود یا ثبت‌نام کاربر
 *     tags:
 *       - Auth
 *     requestBody:
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
 *                 description: کد OTP ارسال شده به موبایل
 *                 example: "12345"
 *               phone:
 *                 type: string
 *                 description: شماره موبایل کاربر
 *                 example: "09121234567"
 *     responses:
 *       200:
 *         description: کد OTP تایید شد و توکن JWT صادر شد
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
 *                   description: توکن دسترسی (JWT)
 *                 message:
 *                   type: string
 *                   example: "OTP verified successfully"
 *       401:
 *         description: اطلاعات ناقص یا کد/شماره موبایل اشتباه است
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "کد یا شماره اشتباه است."
 */

router.post("/verify-otp" , authController.verifyOtp)
/**
 * @swagger
 * /api/v1/users/profile:
 *   post:
 *     summary: تکمیل پروفایل کاربر (فقط کاربران وارد شده)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "علی"
 *               lastName:
 *                 type: string
 *                 example: "محمدی"
 *               userName:
 *                 type: string
 *                 example: "ali_m"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               copassword:
 *                 type: string
 *                 example: "password123"
 *               email:
 *                 type: string
 *                 example: "ali@example.com"
 *               age:
 *                 type: integer
 *                 example: 30
 *               isParent:
 *                 type: boolean
 *                 example: true
 *               childPhone:
 *                 type: string
 *                 example: "09121234567"
 *               isFather:
 *                 type: boolean
 *                 example: false
 *             required:
 *               - firstName
 *               - lastName
 *               - userName
 *               - password
 *               - copassword
 *               - email
 *               - age
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
 *         description: خطا در به‌روزرسانی یا اعتبارسنجی داده‌ها
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "آپدیت انجام نشد"
 *       404:
 *         description: کاربر با شماره کودک یافت نشد
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
router.post("/profile", authMiddleware, validatComplitProfile, authController.compitProfile);
/**
 * @swagger
 * /api/v1/users/profile:
 *   patch:
 *     summary: ویرایش اطلاعات پروفایل کاربر (فقط کاربران وارد شده)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "علی"
 *               lastName:
 *                 type: string
 *                 example: "محمدی"
 *               userName:
 *                 type: string
 *                 example: "ali_m"
 *               email:
 *                 type: string
 *                 example: "ali@example.com"
 *               ega:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       200:
 *         description: پروفایل با موفقیت ویرایش شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     userName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     ega:
 *                       type: integer
 *       404:
 *         description: کاربر یافت نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: خطا در سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.patch("/profile", authMiddleware, authController.editProfile);


module.exports = router