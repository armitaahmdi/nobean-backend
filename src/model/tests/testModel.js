module.exports = (sequelize, DataTypes) => {
  const Exam = sequelize.define('exam', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    time: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // createdat: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    //   allowNull: true
    // },
    mainDescription:{
        type:DataTypes.TEXT,
        allowNull: false
    },
       ShortDescription:{
        type:DataTypes.TEXT,
        allowNull: false
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
    question_count:{
        type:DataTypes.BIGINT,
        allowNull:false,
          defaultValue:0
    },
    target_audience: {
       type: DataTypes.ENUM('ویژه فرزندان', 'ویژه والدین'),
       allowNull: false,
       defaultValue: 'ویژه فرزندان'
},
price:{
    type:DataTypes.BIGINT,
     defaultValue:0,
    allowNull: false,
    
},
 category:{
    type: DataTypes.STRING,
     allowNull: true
    },
suitableFor: {
  type: DataTypes.JSON,
  allowNull: true,
},
  tags: {
  type: DataTypes.JSON,
  allowNull: true
}

    
  }, {
    timestamps: true, // This will add createdAt and updatedAt fields
    tableName: 'exams' // Ensure we're using the correct table name
  });

  return Exam;
};
