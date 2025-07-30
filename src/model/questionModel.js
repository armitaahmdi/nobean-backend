module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('question', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    examId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });

  return Question;
};
