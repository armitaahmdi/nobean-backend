module.exports = (sequelize, DataTypes) => {
  const CommentReaction = sequelize.define('comment_reaction', {
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
    reaction: {
      type: DataTypes.ENUM('like', 'dislike'),
      allowNull: false,
    },
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['comment_id', 'user_id']
      }
    ]
  });

  return CommentReaction;
};


