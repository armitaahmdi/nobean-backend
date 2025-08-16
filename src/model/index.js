const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./../../config/db');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// اینجا مدل‌ها رو ایمپورت می‌کنیم
db.User = require('./userModel')(sequelize, DataTypes);
db.Course = require('./courseModel')(sequelize, DataTypes);
db.Category = require('./categoryModel')(sequelize, DataTypes);
db.test = require('./testModel')(sequelize, DataTypes);
db.Question = require('./questionModel')(sequelize, DataTypes);
db.Item = require('./itemsModel')(sequelize, DataTypes);
db.Categorytest = require('./categoryTestModel')(sequelize, DataTypes);
db.Article = require('./articleModel')(sequelize, DataTypes);
db.Product = require('./productModel')(sequelize, DataTypes);
db.order = require("./orderModel")(sequelize, DataTypes);
db.orderItem = require("./orderItemModel")(sequelize, DataTypes);
db.CartItem = require("./cartItemModel")(sequelize, DataTypes);
db.Cart = require("./cartModel")(sequelize, DataTypes);

//db.testUser = require('./testUserModel')(sequelize, DataTypes);
db.CourseUser = require('./courseUserModel')(sequelize, DataTypes);
db.CategoryCourse = require('./categoryCourseModel')(sequelize, DataTypes);
db.userTest = require('./userTestModel')(sequelize, DataTypes);
db.Podcast = require('./podcastModel')(sequelize, DataTypes);

// Many-to-Many => User <-> Course via course_user
db.User.belongsToMany(db.Course, {
  through: db.CourseUser,
  foreignKey: 'userId',
});

db.Course.belongsToMany(db.User, {
  through: db.CourseUser,
  foreignKey: 'courseId',
});
// Many-to-Many => Category <-> Course via category_course
db.Category.belongsToMany(db.Course, {
  through: db.CategoryCourse,
  foreignKey: 'categoryId',
});

db.Course.belongsToMany(db.Category, {
  through: db.CategoryCourse,
  foreignKey: 'courseId',
});
// One Exam has many Questions
db.test.hasMany(db.Question, {
  foreignKey: 'examId',
  onDelete: 'CASCADE',
});

// Each Question belongs to one Exam
db.Question.belongsTo(db.test, {
  foreignKey: 'examId',
});
// ارتباط بین آزمون و سوال

// ارتباط بین سوال و گزینه
db.Question.hasMany(db.Item, { foreignKey: 'questionId', onDelete: 'CASCADE', as: 'Items'});
db.Item.belongsTo(db.Question, {
  foreignKey: 'questionId',
  as: 'question' // یا همونی که نیاز داری
});

// برای مدل کتگری و تست ها اینو اضافه میکنیم 
db.Category.belongsToMany(db.test, {
  through: db.Categorytest, // ← اصلاح شد
  foreignKey: 'categoryId',
});

db.test.belongsToMany(db.Category, {
  through: db.Categorytest, // ← حرف T بزرگ باید باشه
  foreignKey: 'testId',
});

db.User.belongsToMany(db.test, {
  through: db.userTest,
  foreignKey: 'userId',
  otherKey: 'testId',
});

db.test.belongsToMany(db.User, {
  through: db.userTest,
  foreignKey: 'testId',
  otherKey: 'userId',
});

db.Category.hasMany(db.Product, {
  foreignKey: 'categoryId',
  onDelete: 'SET NULL'
});
db.Product.belongsTo(db.Category, {
  foreignKey: 'categoryId'
});
// رابط بین اردر آیتم
db.order.hasMany(db.orderItem, { foreignKey: 'order_id' });
db.orderItem.belongsTo(db.order, { foreignKey: 'order_id' });

db.Product.hasMany(db.orderItem, { foreignKey: 'product_id' });
db.orderItem.belongsTo(db.Product, { foreignKey: 'product_id' });


// ارتباط کاربر با سفارش
db.User.hasMany(db.order, { foreignKey: 'user_id' });
db.order.belongsTo(db.User, { foreignKey: 'user_id' });

// ارتباط سفارش با آیتم‌های سفارش
db.order.hasMany(db.orderItem, { foreignKey: 'order_id', onDelete: 'CASCADE' });
db.orderItem.belongsTo(db.order, { foreignKey: 'order_id' });


// هر کاربر یک سبد دارد
db.User.hasOne(db.Cart, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.Cart.belongsTo(db.User, { foreignKey: 'user_id' });

// هر سبد چند آیتم دارد
db.Cart.hasMany(db.CartItem, { foreignKey: 'cart_id', onDelete: 'CASCADE' });
db.CartItem.belongsTo(db.Cart, { foreignKey: 'cart_id' });

// هر آیتم مربوط به یک محصول است
db.Product.hasMany(db.CartItem, { foreignKey: 'product_id', onDelete: 'CASCADE' });
db.CartItem.belongsTo(db.Product, { foreignKey: 'product_id' });


module.exports = db;


// دوستان هرکس اینو میخونه این مثل یه نماینده میمونه از مدل ها که برای راحت تر کردن درخواست ها از باقی مدل ها از این استفاذه میشه ما اینو صدا میکنیم این خودش میره ا
//اد میکنه 