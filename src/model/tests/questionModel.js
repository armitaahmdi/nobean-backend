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
    questionNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'شماره سوال در آزمون'
    },
    componentId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'شناسه مولفه‌ای که سوال به آن تعلق دارد'
    }
  });

  return Question;
};
