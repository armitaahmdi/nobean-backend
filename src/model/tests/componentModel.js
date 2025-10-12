module.exports = (sequelize, DataTypes) => {
  const Component = sequelize.define('component', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    domainId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'شناسه حیطه مربوطه'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'نام مولفه'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'توضیحات مولفه'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'ترتیب نمایش مولفه در حیطه'
    }
  }, {
    timestamps: true,
    tableName: 'components',
    indexes: [
      {
        fields: ['domainId']
      }
    ]
  });

  return Component;
};
