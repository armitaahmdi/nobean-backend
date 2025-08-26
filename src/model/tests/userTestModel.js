// models/userTest.js
module.exports = (sequelize, DataTypes) => {
  const UserTest = sequelize.define('UserTest', {
    id:{
          type: DataTypes.BIGINT,
             primaryKey:true,
          
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


  });

  return UserTest;
};
