module.exports = (sequelize, DataTypes) => {
  const UserTest = sequelize.define('UserTest', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    role: {
      type: DataTypes.ENUM('participant', 'observer'),
      defaultValue: 'participant'
    },
    examId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'پاسخ‌های کاربر به صورت JSON'
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'نمره کاربر (0-100)'
    },
    weightedSum: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'جمع ضرایب گزینه‌های انتخاب‌شده'
    },
    maxWeightedSum: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'حداکثر جمع ضرایب ممکن (جمع بیشینه وزن هر سوال)'
    },
    correctAnswers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'تعداد پاسخ‌های صحیح'
    },
    totalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'تعداد کل سوالات'
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'زمان صرف شده به ثانیه'
    },
    status: {
      type: DataTypes.ENUM('in_progress', 'completed'),
      allowNull: false,
      defaultValue: 'in_progress',
      comment: 'وضعیت آزمون'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'زمان تکمیل آزمون'
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['userId', 'examId']
      }
    ]
  });

  UserTest.associate = (models) => {
    // UserTest belongs to User
    UserTest.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'User'
    });

    // UserTest belongs to Exam
    UserTest.belongsTo(models.Exam, {
      foreignKey: 'examId',
      as: 'Exam'
    });
  };

  return UserTest;
};
