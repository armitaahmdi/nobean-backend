module.exports = (sequelize, DataTypes) => {
  const CourseUser = sequelize.define('course_user', {
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    courseId: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  });

  return CourseUser;
};
