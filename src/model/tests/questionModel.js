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
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'توضیح کوتاه درباره سوال'
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'شماره سوال در آزمون'
    }
  });

  return Question;
};
