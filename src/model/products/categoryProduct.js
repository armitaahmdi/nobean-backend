module.exports = (sequelize, DataTypes) => {
  const CategoryProduct = sequelize.define('categoryProduct', {
    categoryId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    productId: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  });

  return CategoryProduct;
};
