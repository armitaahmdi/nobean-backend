// models/userTest.js
module.exports = (sequelize, DataTypes) => {
  const UserTest = sequelize.define('UserTest', {
    role: {
      type: DataTypes.STRING, // مثلاً "participant" یا "observer"
      defaultValue: 'participant',
    }
  });

  return UserTest;
};
