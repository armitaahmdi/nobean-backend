module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('course', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    category: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return Course;
};
