module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define("order_item", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
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
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  });

  return OrderItem;
};
