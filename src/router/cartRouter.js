const express = require('express');
const router = express.Router();

const cartController = require('../controller/cartController');
const verifyToken = require('../middelware/authMiddelware');
const { validateAddToCart, validateUpdateCartItem } = require('../utils/validat/cartvalidation');

// گرفتن سبد خرید کاربر
router.get('/', verifyToken, cartController.getUserCart);

// اضافه کردن محصول به سبد خرید
router.post('/', verifyToken, validateAddToCart, cartController.addToCart);

// ویرایش تعداد محصول در سبد خرید
router.put('/:id', verifyToken, validateUpdateCartItem, cartController.updateCartItem);

// حذف یک آیتم از سبد خرید
router.delete('/:id', verifyToken, cartController.removeCartItem);

// خالی کردن کل سبد خرید
router.delete('/', verifyToken, cartController.clearCart);

module.exports = router;
