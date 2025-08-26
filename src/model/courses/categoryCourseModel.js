module.exports = (sequelize, DataTypes) => {
  const CategoryCourse = sequelize.define('category_course', {
    categoryId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    courseId: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  });

  return CategoryCourse;
};
