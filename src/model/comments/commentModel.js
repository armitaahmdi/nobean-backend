module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('comment', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    parent_comment_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    section_type: {
      type: DataTypes.ENUM('course', 'test', 'product', 'podcast', 'article', 'webinar', 'consultant'), // قابل گسترش
      allowNull: false,
    },
    section_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    idx: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    likes_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    dislikes_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
  }, {
    timestamps: true, // createdAt و updatedAt
  });

  return Comment;
};
