module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define('article', {
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
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    readingTime: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON, // چون آرایه هست و MySQL array نداره
      allowNull: true,
    },
    contentSections: {
      type: DataTypes.JSON, // آرایه‌ای از آبجکت‌ها
      allowNull: true,
    },
    faq: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    reviews: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return Article;
};
