module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('notification', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM('comment_pending', 'comment_approved', 'comment_rejected'),
      allowNull: false,
      defaultValue: 'comment_pending',
    },
    comment_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true, // null = برای همه ادمین‌ها
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    entity_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
  }, {
    timestamps: true,
  });

  return Notification;
};

