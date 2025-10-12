module.exports = (sequelize, DataTypes) => {
  const Domain = sequelize.define('domain', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    examId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'شناسه آزمون مربوطه'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'نام حیطه'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'توضیحات حیطه'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'ترتیب نمایش حیطه در آزمون'
    }
  }, {
    timestamps: true,
    tableName: 'domains',
    indexes: [
      {
        fields: ['examId']
      }
    ]
  });

  return Domain;
};
