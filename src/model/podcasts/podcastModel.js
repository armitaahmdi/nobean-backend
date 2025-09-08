
module.exports = (sequelize, DataTypes) => {
  const podcast = sequelize.define('podcast', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    excerpt_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    audioUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
   guest: {
  type: DataTypes.JSON,
  allowNull: true,
},
tags: {
  type: DataTypes.JSON,
  allowNull: true,
},

    duration: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    publishDate: {
      type: DataTypes.DATE,
      allowNull: true,
        defaultValue: DataTypes.NOW
    },
  });

  return podcast;
};
