// models/userTest.js
module.exports = (sequelize, DataTypes) => {
  const UserTest = sequelize.define('UserTest', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    examId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'tests',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    answers: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'JSON string containing user answers and correct answers'
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Score percentage (0-100)'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Time spent in seconds'
    },
    status: {
      type: DataTypes.ENUM('completed', 'incomplete', 'abandoned'),
      defaultValue: 'completed'
    }
  }, {
    tableName: 'user_tests',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['examId', 'userId']
      }
    ]
  });

  return UserTest;
};
