module.exports = (sequelize, DataTypes) => {
    const ExamResult = sequelize.define('examResult', {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      examId: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      answers: {
        type: DataTypes.JSON, 
        allowNull: true,
        comment: 'فرمت پیشنهادی: {questionId: selectedItemIndex}'
      },
      score: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
        defaultValue: 'not_started'
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      finishedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      timestamps: true,
      tableName: 'exam_results'
    });
  
    return ExamResult;
  };
  