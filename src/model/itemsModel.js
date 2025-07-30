
module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define('item', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    questionId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    items: {
      type: DataTypes.JSON,  // یا DataTypes.TEXT هم میشه با stringify
      allowNull: false
    },
    correctIndex: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  return Item;
};
