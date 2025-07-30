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
      default: 'student'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ega: {
      type: DataTypes.BIGINT,
      allowNull: true
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

  return User;
};
