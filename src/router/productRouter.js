const express = require('express');
const router = express.Router();

const authMiddleware = require("../middelware/authMiddelware")
const  isAdmin = require("./../middelware/isAdmin")
const productController = require('../controller/productController'); // مسیر به controller
const  {validateProduct} = require("./../utils/validat/productValidat")
// گرفتن همه محصولات
router.get('/', productController.getAllProducts);

// گرفتن جزئیات یک محصول
router.get('/:id', productController.getProductById);

// ایجاد محصول جدید (ادمین)
router.post('/', authMiddleware,isAdmin,validateProduct,productController.createProduct);

// ویرایش محصول موجود (ادمین)
router.put('/:id',authMiddleware,isAdmin,validateProduct, productController.updateProduct);

// حذف محصول (ادمین)
router.delete('/:id',authMiddleware,isAdmin,validateProduct, productController.deleteProduct);

module.exports = router;
