const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./../../config/db');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// اینجا مدل‌ها رو ایمپورت می‌کنیم
db.User = require('./userModel')(sequelize, DataTypes);
db.Course = require('./courses/courseModel')(sequelize, DataTypes);
db.Category = require('./categoryModel')(sequelize, DataTypes);
db.test = require('./tests/testModel')(sequelize, DataTypes);
db.Question = require('./tests/questionModel')(sequelize, DataTypes);
db.Item = require('./tests/itemsQuestionModel')(sequelize, DataTypes);
db.Categorytest = require('./tests/categoryTestModel')(sequelize, DataTypes);
db.Article = require('./articles/articleModel')(sequelize, DataTypes);
db.Product = require('./products/productModel')(sequelize, DataTypes);
db.order = require("./carts/orders/orderModel")(sequelize, DataTypes);
db.orderItem = require("./carts/orders/orderItemModel")(sequelize, DataTypes);
db.CartItem = require("./carts/cartItemModel")(sequelize, DataTypes);
db.Cart = require("./carts/cartModel")(sequelize, DataTypes);
db.Comment = require("./comments/commentModel")(sequelize , DataTypes);
//db.testUser = require('./testUserModel')(sequelize, DataTypes);
db.CourseUser = require('./courses/courseUserModel')(sequelize, DataTypes);
db.CategoryCourse = require('./courses/categoryCourseModel')(sequelize, DataTypes);
db.userTest = require('./tests/userTestModel')(sequelize, DataTypes);
db.Podcast = require('./podcasts/podcastModel')(sequelize, DataTypes);
db.CategoryProduct=require("./products/categoryProduct")(sequelize, DataTypes);
db.Otp=require("./otp/otpModel")(sequelize, DataTypes);
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

// UserTest associations
db.User.hasMany(db.userTest, { foreignKey: 'userId', as: 'User' });
db.userTest.belongsTo(db.User, { foreignKey: 'userId', as: 'User' });

db.test.hasMany(db.userTest, { foreignKey: 'examId' });
db.userTest.belongsTo(db.test, { foreignKey: 'examId' });

db.Product.belongsToMany(db.Category, {
  through: db.CategoryProduct, // اسم جدول واسطه
  foreignKey: 'productId',
  otherKey: 'categoryId',
  as: 'categories'
});

db.Category.belongsToMany(db.Product, {
  through: db.CategoryProduct,
  foreignKey: 'categoryId',
  otherKey: 'productId',
  as: 'products'
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


// روابط
db.User.hasMany(db.Comment, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.Comment.belongsTo(db.User, { foreignKey: 'user_id' });

// رابطه خودارجاعی (یک کامنت می‌تونه ریپلای داشته باشه)
db.Comment.hasMany(db.Comment, { 
  foreignKey: 'parent_comment_id', 
  as: 'Replies' 
});
db.Comment.belongsTo(db.Comment, { 
  foreignKey: 'parent_comment_id', 
  as: 'Parent' 
});
module.exports = db;


// دوستان هرکس اینو میخونه این مثل یه نماینده میمونه از مدل ها که برای راحت تر کردن درخواست ها از باقی مدل ها از این استفاذه میشه ما اینو صدا میکنیم این خودش میره ا
//اد میکنه 