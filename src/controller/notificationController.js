const db = require('../model/index');
const Notification = db.Notification;
const Comment = db.Comment;
const User = db.User;
const { Op } = require('sequelize');

// دریافت notifications برای ادمین
exports.getNotifications = async (req, res) => {
  try {
    const { limit = 20, unread_only = false } = req.query;
    const user_id = req.user?.id;

    const whereClause = {
      user_id: { [Op.or]: [null, user_id] } // null = همه ادمین‌ها، یا user_id خاص
    };

    if (unread_only === 'true') {
      whereClause.is_read = false;
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      include: [
        {
          model: Comment,
          as: 'Comment',
          include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'userName'],
            required: false
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    // محاسبه تعداد unread
    const unreadCount = await Notification.count({
      where: {
        ...whereClause,
        is_read: false
      }
    });

    res.status(200).json({
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

// mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // بررسی اینکه notification متعلق به این کاربر هست یا عمومی (user_id = null)
    if (notification.user_id !== null && notification.user_id !== user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await notification.update({ is_read: true });

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

// mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    const user_id = req.user?.id;

    await Notification.update(
      { is_read: true },
      {
        where: {
          user_id: { [Op.or]: [null, user_id] },
          is_read: false
        }
      }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all as read error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

