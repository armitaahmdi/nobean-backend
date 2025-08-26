const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categoryController');
const isAdmin = require("../middelware/isAdmin")
const authMiddleware = require("../middelware/authMiddelware");

// مسیرها
router.get('/',categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/',authMiddleware,isAdmin, categoryController.createCategory);
router.put('/:id',authMiddleware,isAdmin, categoryController.updateCategory);
router.delete('/:id',authMiddleware,isAdmin, categoryController.deleteCategory);

module.exports = router;
