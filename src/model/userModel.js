module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('admin', 'teacher', 'student','parent', ),
      allowNull: true,
      defaultValue: 'student'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    birthDate: { 
      type: DataTypes.STRING, //فرمت تاریخ مثل 17.11.1383
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isParent : {
       type: DataTypes.BOOLEAN,
      defaultValue: false,
       allowNull:true
    },
    childPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isFather: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    motherId:{
      type:DataTypes.BIGINT,
      allowNull:true,
    }, 
    fatherId:{
      type:DataTypes.BIGINT,
      allowNull:true,
    },
  }, {
    timestamps: true
  });

  User.associate = (models) => {
    // User has many UserTest
    User.hasMany(models.UserTest, {
      foreignKey: 'userId',
      as: 'UserTests'
    });
  };

  return User;
};
