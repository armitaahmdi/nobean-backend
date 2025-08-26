const db = require('../model/index');
const Comment = db.Comment;

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

    // 4. ایجاد کامنت
    const newComment = await Comment.create({
      user_id,
      text,
      parent_comment_id: parentId,
      section_type,
      section_id,
      idx
    });

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

    // 1. ولیدیشن
    if (!section_type || !section_id) {
      return res.status(400).json({ error: "section_type و section_id الزامی هستند" });
    }

    // 2. دریافت کامنت‌های اصلی + ریپلای‌ها
    const comments = await Comment.findAll({
      where: { section_type, section_id, parent_comment_id: null },
      include: [{
        model: Comment,
        as: 'Replies',
        separate: true,        // ریپلای‌ها با کوئری جداگانه
        order: [['idx', 'ASC']]
      }],
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
