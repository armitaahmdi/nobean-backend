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
      type: DataTypes.STRING(50), // course, exam, lesson, ...
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
  }, {
    timestamps: true, // createdAt و updatedAt
  });

  return Comment;
};
