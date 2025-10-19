const { Article } = require('../model');
const { Op } = require('sequelize');

// دریافت همه مقالات
const getAllArticles = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {};
        
        // فیلتر دسته‌بندی
        if (category) {
            whereClause.category = category;
        }
        
        // جستجو در عنوان و خلاصه
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { excerpt_description: { [Op.like]: `%${search}%` } }
            ];
        }

        const articles = await Article.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            articles: articles.rows,
            total: articles.count,
            page: parseInt(page),
            totalPages: Math.ceil(articles.count / limit)
        });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'خطا در دریافت مقالات' });
    }
};

// دریافت مقاله بر اساس ID
const getArticleById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const article = await Article.findByPk(id);
        
        if (!article) {
            return res.status(404).json({ error: 'مقاله مورد نظر یافت نشد' });
        }

        res.json(article);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'خطا در دریافت مقاله' });
    }
};

// ایجاد مقاله جدید (ادمین)
const createArticle = async (req, res) => {
    try {
        const {
            title,
            excerpt,
            description,
            author,
            date,
            image,
            readingTime,
            category,
            tags,
            contentSections,
            faqs,
            reviews
        } = req.body;

        // اعتبارسنجی فیلدهای الزامی
        if (!title || !excerpt || !description) {
            return res.status(400).json({ 
                error: 'عنوان، خلاصه و توضیحات الزامی هستند' 
            });
        }

        const article = await Article.create({
            title,
            excerpt_description: excerpt,
            description,
            author: author || 'نوین کد',
            date: date || new Date(),
            image,
            readingTime: readingTime || 5,
            category: category || 'عمومی',
            tags: tags || [],
            contentSections: contentSections || [],
            faqs: faqs || [],
            reviews: reviews || []
        });

        res.status(201).json({
            message: 'مقاله با موفقیت ایجاد شد',
            article
        });
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ error: 'خطا در ایجاد مقاله' });
    }
};

// ویرایش مقاله (ادمین)
const updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const article = await Article.findByPk(id);
        
        if (!article) {
            return res.status(404).json({ error: 'مقاله مورد نظر یافت نشد' });
        }

        // به‌روزرسانی فیلدها
        await article.update(updateData);

        res.json({
            message: 'مقاله با موفقیت به‌روزرسانی شد',
            article
        });
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ error: 'خطا در به‌روزرسانی مقاله' });
    }
};

// حذف مقاله (ادمین)
const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;

        const article = await Article.findByPk(id);
        
        if (!article) {
            return res.status(404).json({ error: 'مقاله مورد نظر یافت نشد' });
        }

        await article.destroy();

        res.json({ message: 'مقاله با موفقیت حذف شد' });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ error: 'خطا در حذف مقاله' });
    }
};

// دریافت آمار مقالات (ادمین)
const getArticleStats = async (req, res) => {
    try {
        const totalArticles = await Article.count();
        const publishedArticles = await Article.count({ 
            where: { status: 'published' } 
        });
        const draftArticles = await Article.count({ 
            where: { status: 'draft' } 
        });

        // آمار دسته‌بندی‌ها
        const categoryStats = await Article.findAll({
            attributes: [
                'category',
                [Article.sequelize.fn('COUNT', Article.sequelize.col('id')), 'count']
            ],
            group: ['category'],
            raw: true
        });

        res.json({
            total: totalArticles,
            published: publishedArticles,
            draft: draftArticles,
            categories: categoryStats
        });
    } catch (error) {
        console.error('Error fetching article stats:', error);
        res.status(500).json({ error: 'خطا در دریافت آمار مقالات' });
    }
};

// دریافت مقالات اخیر (ادمین)
const getRecentArticles = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        const articles = await Article.findAll({
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'title', 'category', 'createdAt', 'author']
        });

        res.json(articles);
    } catch (error) {
        console.error('Error fetching recent articles:', error);
        res.status(500).json({ error: 'خطا در دریافت مقالات اخیر' });
    }
};

// جستجوی مقالات
const searchArticles = async (req, res) => {
    try {
        const { q, category, limit = 10 } = req.query;

        let whereClause = {};

        if (q) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${q}%` } },
                { excerpt_description: { [Op.like]: `%${q}%` } },
                { description: { [Op.like]: `%${q}%` } }
            ];
        }

        if (category) {
            whereClause.category = category;
        }

        const articles = await Article.findAll({
            where: whereClause,
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        res.json(articles);
    } catch (error) {
        console.error('Error searching articles:', error);
        res.status(500).json({ error: 'خطا در جستجوی مقالات' });
    }
};

module.exports = {
    getAllArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    getArticleStats,
    getRecentArticles,
    searchArticles
};
