module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define("Otp", {
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: "otps",
    timestamps: false,
  });

  return Otp;
};
