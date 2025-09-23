
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
    // وزن هر گزینه به صورت آرایه‌ای از ضرایب 1 تا 5، هم‌طول با items
    weights: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'آرایه ضرایب هر گزینه (1 تا 5) هم‌طول با items'
    },
    correctIndex: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  return Item;
};
