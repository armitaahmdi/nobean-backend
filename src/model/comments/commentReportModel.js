module.exports = (sequelize, DataTypes) => {
  const CommentReport = sequelize.define('comment_report', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    comment_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    timestamps: true,
  });

  return CommentReport;
};


