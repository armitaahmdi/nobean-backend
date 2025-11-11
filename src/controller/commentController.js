const db = require('../model/index');
const { Op } = require('sequelize');
const Comment = db.Comment;
const CommentReaction = db.CommentReaction;
const CommentReport = db.CommentReport;
const User = db.User;
const Notification = db.Notification;
const { Sequelize } = db;

// ایجاد کامنت جدید
exports.createComment = async (req, res) => {
  try {
    const { text, section_type, section_id, parent_comment_id } = req.body;
    const user_id = req.user?.id; // از authMiddleware میاد

    // 1. ولیدیشن اولیه
    if (!text || !section_type || !section_id) {
      return res.status(400).json({ error: "text, section_type و section_id الزامی هستند" });
    }
    if (!user_id) {
      return res.status(401).json({ error: "کاربر احراز هویت نشده است" });
    }

    // 2. هندل parent_comment_id
    let parentId = null;
    if (parent_comment_id && parent_comment_id !== "null" && parent_comment_id !== "undefined" && parent_comment_id !== "") {
      // بررسی اینکه parent وجود دارد
      const parentExists = await Comment.findByPk(parent_comment_id);
      if (!parentExists) {
        return res.status(400).json({ error: "parent_comment_id معتبر نیست" });
      }
      parentId = parent_comment_id;
    }

    // 3. محاسبه idx
    let idx = 0;
    if (parentId) {
      const count = await Comment.count({ where: { parent_comment_id: parentId } });
      idx = count + 1;
    } else {
      const count = await Comment.count({ 
        where: { section_type, section_id, parent_comment_id: null } 
      });
      idx = count + 1;
    }

    // 4. ایجاد کامنت با status pending برای moderation
    const newComment = await Comment.create({
      user_id,
      text,
      parent_comment_id: parentId,
      section_type,
      section_id,
      idx,
      status: 'pending'
    });

    // 5. ایجاد notification برای ادمین‌ها
    const entityTypeMap = {
      'article': 'مقاله',
      'test': 'آزمون',
      'course': 'دوره',
      'product': 'محصول',
      'podcast': 'پادکست',
      'webinar': 'وبینار',
      'consultant': 'مشاور'
    };
    const entityTypeLabel = entityTypeMap[section_type] || section_type;
    const message = `کامنت جدید در ${entityTypeLabel} #${section_id} ثبت شده و در انتظار تایید است`;

    try {
      await Notification.create({
        type: 'comment_pending',
        comment_id: newComment.id,
        user_id: null, // null = برای همه ادمین‌ها
        message: message,
        is_read: false,
        entity_type: section_type,
        entity_id: section_id
      });
    } catch (notifErr) {
      console.error('Error creating notification:', notifErr);
      // اگر notification ایجاد نشد، خطا نمی‌دهیم
    }

    res.status(201).json(newComment);
  } catch (err) {
    console.error("Create comment error:", err);
    res.status(500).json({ error: "خطایی در سرور رخ داد", detail: err.message });
  }
};

// گرفتن همه کامنت‌ها برای یک سکشن
exports.getCommentsBySection = async (req, res) => {
  try {
    const { section_type, section_id } = req.query;
    const user_id = req.user?.id; // برای نمایش کامنت‌های pending کاربر

    // 1. ولیدیشن
    if (!section_type || !section_id) {
      return res.status(400).json({ error: "section_type و section_id الزامی هستند" });
    }

    // 2. ساخت where clause: فقط approved ها یا pending های کاربر خودش
    const whereClause = {
      section_type,
      section_id,
      parent_comment_id: null,
      [Op.or]: [
        { status: 'approved' },
        ...(user_id ? [{ status: 'pending', user_id }] : [])
      ]
    };

    // 3. دریافت کامنت‌های اصلی + ریپلای‌ها
    const comments = await Comment.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'userName'],
          required: false
        },
        {
          model: Comment,
          as: 'Replies',
          separate: true,        // ریپلای‌ها با کوئری جداگانه
          order: [['idx', 'ASC']],
          where: {
            [Op.or]: [
              { status: 'approved' },
              ...(user_id ? [{ status: 'pending', user_id: user_id }] : [])
            ]
          },
          include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'userName'],
            required: false
          }]
        }
      ],
      order: [['idx', 'ASC']], // ترتیب خود کامنت‌های اصلی
    });

    // 3. بررسی نتیجه
    if (comments.length === 0) {
      return res.status(404).json({ message: "هیچ کامنتی وجود ندارد" });
    }

    res.status(200).json(comments);
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ error: err.message });
  }
};


// گرفتن ریپلای‌های یک کامنت
exports.getRepliesByComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { section_type, section_id } = req.query;
    const parentId = parseInt(id, 10);

    if (isNaN(parentId)) {
      return res.status(400).json({ error: "id نامعتبر است" });
    }
    if (!section_type || !section_id) {
      return res.status(400).json({ error: "section_type و section_id الزامی هستند" });
    }

    const replies = await Comment.findAll({
      where: { 
        parent_comment_id: parentId,
        section_type,
        section_id
      },
      order: [['idx', 'ASC']]
    });

    if (replies.length === 0) {
      return res.status(404).json({ message: "هیچ ریپلای‌ای برای این کامنت وجود ندارد" });
    }

    res.status(200).json(replies);
  } catch (err) {
    console.error("Get replies error:", err);
    res.status(500).json({ error: err.message });
  }
};


// ویرایش کامنت
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const user_id = req.user?.id;

    // ۱. چک کردن ورودی
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "متن کامنت نمی‌تواند خالی باشد" });
    }

    if (!user_id) {
      return res.status(401).json({ error: "احراز هویت نامعتبر است" });
    }

    // ۲. پیدا کردن کامنت
    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({ error: "کامنت پیدا نشد" });
    }

    // ۳. بررسی مجوز
    if (comment.user_id !== user_id) {
      return res.status(403).json({ error: "شما اجازه ویرایش این کامنت را ندارید" });
    }

    // ۴. آپدیت کردن
    await comment.update({ text });

    res.status(200).json({
      message: "کامنت با موفقیت ویرایش شد",
      comment,
    });

  } catch (err) {
    console.error("Update comment error:", err);
    res.status(500).json({ error: "خطای داخلی سرور", details: err.message });
  }
};

// لایک یا دیسلایک با یک رای برای هر کاربر
exports.reactToComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'like' | 'dislike'
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ error: 'type must be like or dislike' });
    }

    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // find existing reaction
    const existing = await CommentReaction.findOne({ where: { comment_id: id, user_id } });

    if (!existing) {
      await CommentReaction.create({ comment_id: id, user_id, reaction: type });
      if (type === 'like') {
        await comment.increment('likes_count');
      } else {
        await comment.increment('dislikes_count');
      }
      return res.status(200).json({ status: 'ok', action: 'created', type });
    }

    if (existing.reaction === type) {
      // toggle off
      await existing.destroy();
      if (type === 'like') {
        await comment.decrement('likes_count');
      } else {
        await comment.decrement('dislikes_count');
      }
      return res.status(200).json({ status: 'ok', action: 'removed', type });
    }

    // switch reaction
    const prev = existing.reaction;
    existing.reaction = type;
    await existing.save();
    if (type === 'like') {
      await comment.increment('likes_count');
      await comment.decrement('dislikes_count');
    } else {
      await comment.increment('dislikes_count');
      await comment.decrement('likes_count');
    }
    return res.status(200).json({ status: 'ok', action: 'switched', from: prev, to: type });
  } catch (err) {
    console.error('React comment error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

// گزارش تخلف
exports.reportComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user_id = req.user?.id;

    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const report = await CommentReport.create({ comment_id: id, user_id, reason: reason || null });
    return res.status(201).json({ message: 'Report submitted', report });
  } catch (err) {
    console.error('Report comment error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

// تایید یا رد کامنت (برای ادمین)
exports.moderateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' یا 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'action must be approve or reject' });
    }

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await comment.update({ status: newStatus });

    // mark related notifications as read
    try {
      await Notification.update(
        { is_read: true },
        {
          where: {
            comment_id: id,
            type: 'comment_pending'
          }
        }
      );
    } catch (notifErr) {
      console.error('Error updating notifications:', notifErr);
      // اگر notification update نشد، خطا نمی‌دهیم
    }

    res.status(200).json({
      message: `Comment ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      comment
    });
  } catch (err) {
    console.error('Moderate comment error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

// دریافت کامنت‌های جدید برای ادمین
exports.getRecentComments = async (req, res) => {
  try {
    const { limit = 20, days = 7 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const comments = await Comment.findAll({
      where: {
        createdAt: {
          [Op.gte]: daysAgo
        }
      },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'userName'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    // محاسبه آمار
    const totalComments = await Comment.count();
    const recentCommentsCount = await Comment.count({
      where: {
        createdAt: {
          [Op.gte]: daysAgo
        }
      }
    });
    const pendingCommentsCount = await Comment.count({
      where: {
        status: 'pending'
      }
    });

    res.status(200).json({
      comments,
      stats: {
        total: totalComments,
        recent: recentCommentsCount,
        pending: pendingCommentsCount,
        days: parseInt(days)
      }
    });
  } catch (err) {
    console.error('Get recent comments error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};


// حذف کامنت
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const user_role = req.user?.role;

    // ۱. چک ورودی
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: "شناسه کامنت نامعتبر است" });
    }
    if (!user_id) {
      return res.status(401).json({ error: "احراز هویت نامعتبر است" });
    }

    // ۲. پیدا کردن کامنت
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: "کامنت پیدا نشد" });
    }

    // ۳. بررسی مجوز
    const isOwner = comment.user_id === user_id;
    const isAdmin = user_role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "شما اجازه حذف این کامنت را ندارید" });
    }

    // ⚡️ ۴. اگر ریپلای داشته باشه → پاک کنیم یا orphan کنیم؟
    // اینجا انتخاب داری: 
    // - یا ریپلای‌ها رو cascade پاک کنیم
    // - یا parent_comment_id رو null کنیم (تا مستقل بشن)

    await Comment.destroy({
      where: {
        [Sequelize.Op.or]: [
          { id },                // خود کامنت
          { parent_comment_id: id } // همه ریپلای‌هاش
        ]
      }
    });

    // ۵. پاسخ
    return res.status(200).json({
      message: "کامنت و ریپلای‌های مربوطه با موفقیت حذف شدند"
    });

  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ error: "خطای داخلی سرور", details: err.message });
  }
};
