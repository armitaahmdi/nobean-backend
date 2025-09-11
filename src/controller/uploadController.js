const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Create subdirectories for different file types
        let subDir = 'general';
        if (file.mimetype.startsWith('image/')) {
            subDir = 'images';
        } else if (file.mimetype.startsWith('video/')) {
            subDir = 'videos';
        }

        const fullPath = path.join(uploadDir, subDir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }

        cb(null, fullPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter to allow only images and videos
const fileFilter = (req, file, cb) => {
    console.log('File upload attempt:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname
    });
    
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        console.error('File type not allowed:', file.mimetype);
        cb(new Error('فقط فایل‌های تصویری و ویدیو مجاز است'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit for videos
        fieldSize: 100 * 1024 * 1024, // 100MB field size limit
        files: 1, // Single file upload
        fieldNameSize: 100, // 100 bytes
        fieldValueSize: 100 * 1024 * 1024 // 100MB
    }
});

// Upload single file
exports.uploadFile = async (req, res) => {
    try {
        // Use multer middleware
        upload.single('file')(req, res, (err) => {
            if (err) {
                console.error('Upload error:', err);
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'حجم فایل بیش از حد مجاز است (حداکثر 50 مگابایت)'
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: err.message || 'خطا در آپلود فایل'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'هیچ فایلی انتخاب نشده است'
                });
            }

            // Generate URL for the uploaded file
            const filePath = req.file.path;
            const uploadsIndex = filePath.indexOf('uploads');
            let relativePath;
            
            if (uploadsIndex !== -1) {
                relativePath = filePath.substring(uploadsIndex + 'uploads'.length).replace(/\\/g, '/');
            } else {
                // Fallback: extract path after uploads directory
                const pathParts = filePath.split(path.sep);
                const uploadsIndex = pathParts.indexOf('uploads');
                if (uploadsIndex !== -1) {
                    relativePath = '/' + pathParts.slice(uploadsIndex + 1).join('/');
                } else {
                    relativePath = '/' + req.file.filename;
                }
            }
            
            const fileUrl = `/uploads${relativePath}`;

            res.json({
                success: true,
                message: 'فایل با موفقیت آپلود شد',
                filename: req.file.filename,
                originalName: req.file.originalname,
                url: fileUrl,
                size: req.file.size,
                mimetype: req.file.mimetype
            });
        });
    } catch (error) {
        console.error('Upload controller error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور در آپلود فایل'
        });
    }
};

// Upload multiple files
exports.uploadMultipleFiles = async (req, res) => {
    try {
        upload.array('files', 10)(req, res, (err) => {
            if (err) {
                console.error('Upload error:', err);
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'حجم فایل بیش از حد مجاز است (حداکثر 50 مگابایت)'
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: err.message || 'خطا در آپلود فایل‌ها'
                });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'هیچ فایلی انتخاب نشده است'
                });
            }

            const uploadedFiles = req.files.map(file => {
                const filePath = file.path;
                const uploadsIndex = filePath.indexOf('uploads');
                let relativePath;
                
                if (uploadsIndex !== -1) {
                    relativePath = filePath.substring(uploadsIndex + 'uploads'.length).replace(/\\/g, '/');
                } else {
                    // Fallback: extract path after uploads directory
                    const pathParts = filePath.split(path.sep);
                    const uploadsIndex = pathParts.indexOf('uploads');
                    if (uploadsIndex !== -1) {
                        relativePath = '/' + pathParts.slice(uploadsIndex + 1).join('/');
                    } else {
                        relativePath = '/' + file.filename;
                    }
                }
                
                return {
                    filename: file.filename,
                    originalName: file.originalname,
                    url: `/uploads${relativePath}`,
                    size: file.size,
                    mimetype: file.mimetype
                };
            });

            res.json({
                success: true,
                message: 'فایل‌ها با موفقیت آپلود شدند',
                files: uploadedFiles
            });
        });
    } catch (error) {
        console.error('Upload controller error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور در آپلود فایل‌ها'
        });
    }
};

// Delete file
exports.deleteFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../../uploads', filename);

        // Check if file exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({
                success: true,
                message: 'فایل با موفقیت حذف شد'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'فایل یافت نشد'
            });
        }
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور در حذف فایل'
        });
    }
};
