const express = require('express');
const router = express.Router();
const uploadController = require('../controller/uploadController');
const authMiddleware = require('../middelware/authMiddelware');
const isAdmin = require('../middelware/isAdmin');

// Upload single file (protected route - requires authentication)
router.post('/upload', authMiddleware, uploadController.uploadFile);

// Upload multiple files (protected route - requires authentication)
router.post('/upload-multiple', authMiddleware, uploadController.uploadMultipleFiles);

// Delete file (protected route - requires admin authentication)
router.delete('/delete/:filename', authMiddleware, isAdmin, uploadController.deleteFile);

module.exports = router;
