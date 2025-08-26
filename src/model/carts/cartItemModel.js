module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define('cart_item', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    cart_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    product_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  });

  return CartItem;
};
