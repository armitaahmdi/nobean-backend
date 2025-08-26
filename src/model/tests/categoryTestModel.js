module.exports = (sequelize, DataTypes) => {
  const CategoryTest = sequelize.define('category_test', {
    categoryId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    testId: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  });

  return CategoryTest;
};
