module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('cart', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => {
        let d = new Date();
        d.setDate(d.getDate() + 7); // ۷ روز بعد
        return d;
      }
}

  });

  return Cart;
};
