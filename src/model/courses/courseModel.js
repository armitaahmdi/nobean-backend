module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('course', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    category: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    excerpt_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },   
    imagePath:{
    type: DataTypes.STRING,
     allowNull: true
    },
    participants:{
        type:DataTypes.BIGINT,
        allowNull:false,
       defaultValue:0
    },
    suitableFor: {
  type: DataTypes.JSON,
  allowNull: true,
},  
  time: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
  });

  return Course;
};





