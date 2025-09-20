// models/userTest.js
module.exports = (sequelize, DataTypes) => {
  const UserTest = sequelize.define('UserTest', {
    id:{
          type: DataTypes.BIGINT,
             primaryKey:true,
          autoIncrement: true
    },
    role: {
      type: DataTypes.STRING, // مثلاً "participant" یا "observer"
      defaultValue: 'participant',
      
    },
    examId: {
        type:DataTypes.BIGINT,
          primaryKey:false
    },
    userId: {
        type:DataTypes.BIGINT,
        primaryKey:false

    },
    // فیلدهای جدید برای ذخیره نتیجه آزمون
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
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'in_progress',
      comment: 'وضعیت آزمون: in_progress, completed'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'زمان تکمیل آزمون'
    }

  });

  return UserTest;
};
