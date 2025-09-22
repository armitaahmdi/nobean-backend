const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./../../config/db');

const db = {};

// Sequelize instance
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// مدل‌ها
db.User = require('./userModel')(sequelize, DataTypes);
db.Exam = require('./tests/testModel')(sequelize, DataTypes);
db.Question = require('./tests/questionModel')(sequelize, DataTypes);
db.Item = require('./tests/itemsQuestionModel')(sequelize, DataTypes);
db.UserTest = require('./tests/userTestModel')(sequelize, DataTypes);
db.Category = require('./categoryModel')(sequelize, DataTypes);
db.CategoryTest = require('./tests/categoryTestModel')(sequelize, DataTypes);
db.Article = require('./articles/articleModel')(sequelize, DataTypes);
db.Product = require('./products/productModel')(sequelize, DataTypes);
db.CategoryProduct = require('./products/categoryProduct')(sequelize, DataTypes);
db.Order = require('./carts/orders/orderModel')(sequelize, DataTypes);
db.OrderItem = require('./carts/orders/orderItemModel')(sequelize, DataTypes);
db.Cart = require('./carts/cartModel')(sequelize, DataTypes);
db.CartItem = require('./carts/cartItemModel')(sequelize, DataTypes);
db.Comment = require('./comments/commentModel')(sequelize, DataTypes);
db.Course = require('./courses/courseModel')(sequelize, DataTypes);
db.CourseUser = require('./courses/courseUserModel')(sequelize, DataTypes);
db.CategoryCourse = require('./courses/categoryCourseModel')(sequelize, DataTypes);
db.Podcast = require('./podcasts/podcastModel')(sequelize, DataTypes);
db.Otp = require('./otp/otpModel')(sequelize, DataTypes);
db.ExamResult = require('./tests/examResultModel')(sequelize, DataTypes);
db.Webinar = require('./WebinarModel')(sequelize, DataTypes);

// روابط آزمون و سوالات
db.Exam.hasMany(db.Question, { foreignKey: 'examId', onDelete: 'CASCADE' });
db.Question.belongsTo(db.Exam, { foreignKey: 'examId' });

// سوال و گزینه‌ها
db.Question.hasMany(db.Item, { foreignKey: 'questionId', onDelete: 'CASCADE', as: 'Items' });
db.Item.belongsTo(db.Question, { foreignKey: 'questionId', as: 'question' });

// کاربر ↔ نتایج آزمون
db.User.hasMany(db.UserTest, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.UserTest.belongsTo(db.User, { foreignKey: 'userId' });

// آزمون ↔ نتایج آزمون
db.Exam.hasMany(db.UserTest, { foreignKey: 'examId', onDelete: 'CASCADE' });
db.UserTest.belongsTo(db.Exam, { foreignKey: 'examId' });

// آزمون ↔ نتایج آزمون (ExamResult)
db.Exam.hasMany(db.ExamResult, { foreignKey: 'examId', onDelete: 'CASCADE' });
db.ExamResult.belongsTo(db.Exam, { foreignKey: 'examId' });

// کاربر ↔ نتایج آزمون (ExamResult)
db.User.hasMany(db.ExamResult, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.ExamResult.belongsTo(db.User, { foreignKey: 'userId' });

// Category ↔ Exam
db.Category.belongsToMany(db.Exam, { through: db.CategoryTest, foreignKey: 'categoryId' });
db.Exam.belongsToMany(db.Category, { through: db.CategoryTest, foreignKey: 'examId' });

// Category ↔ Product
db.Product.belongsToMany(db.Category, { through: db.CategoryProduct, foreignKey: 'productId', otherKey: 'categoryId', as: 'categories' });
db.Category.belongsToMany(db.Product, { through: db.CategoryProduct, foreignKey: 'categoryId', otherKey: 'productId', as: 'products' });

// Course ↔ User
db.User.belongsToMany(db.Course, { through: db.CourseUser, foreignKey: 'userId' });
db.Course.belongsToMany(db.User, { through: db.CourseUser, foreignKey: 'courseId' });

// Category ↔ Course
db.Category.belongsToMany(db.Course, { through: db.CategoryCourse, foreignKey: 'categoryId' });
db.Course.belongsToMany(db.Category, { through: db.CategoryCourse, foreignKey: 'courseId' });

// Order ↔ OrderItem
db.Order.hasMany(db.OrderItem, { foreignKey: 'order_id', onDelete: 'CASCADE' });
db.OrderItem.belongsTo(db.Order, { foreignKey: 'order_id' });
db.Product.hasMany(db.OrderItem, { foreignKey: 'product_id', onDelete: 'CASCADE' });
db.OrderItem.belongsTo(db.Product, { foreignKey: 'product_id' });

// User ↔ Order
db.User.hasMany(db.Order, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.Order.belongsTo(db.User, { foreignKey: 'user_id' });

// Cart ↔ CartItem
db.Cart.hasMany(db.CartItem, { foreignKey: 'cart_id', onDelete: 'CASCADE' });
db.CartItem.belongsTo(db.Cart, { foreignKey: 'cart_id' });
db.Product.hasMany(db.CartItem, { foreignKey: 'product_id', onDelete: 'CASCADE' });
db.CartItem.belongsTo(db.Product, { foreignKey: 'product_id' });

// User ↔ Cart
db.User.hasOne(db.Cart, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.Cart.belongsTo(db.User, { foreignKey: 'user_id' });

// User ↔ Comment
db.User.hasMany(db.Comment, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.Comment.belongsTo(db.User, { foreignKey: 'user_id' });

// Comment self-relation (Replies)
db.Comment.hasMany(db.Comment, { foreignKey: 'parent_comment_id', as: 'Replies' });
db.Comment.belongsTo(db.Comment, { foreignKey: 'parent_comment_id', as: 'Parent' });

module.exports = db;


// دوستان هرکس اینو میخونه این مثل یه نماینده میمونه از مدل ها که برای راحت تر کردن درخواست ها از باقی مدل ها از این استفاذه میشه ما اینو صدا میکنیم این خودش میره ا
//اد میکنه 