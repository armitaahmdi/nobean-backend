const db = require('../model/index'); // مسیر رو با پروژه خودت چک کن
const Category = db.Category
// گرفتن همه دسته‌ها
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    if(!categories){
        return res.status(401).json({message: "کتگوری پیدا نشد"})
    }
    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'مشکلی در دریافت دسته‌ها پیش آمد.' });
  }
};

// گرفتن دسته بر اساس id
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'دسته‌بندی پیدا نشد.' });
    res.status(200).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'مشکلی در دریافت دسته‌بندی پیش آمد.' });
  }
};

// ایجاد دسته جدید
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'نام دسته‌بندی الزامی است.' });

    const newCategory = await Category.create({ name, description });
    res.status(201).json({ message: 'دسته‌بندی ایجاد شد', category: newCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'مشکلی در ایجاد دسته‌بندی پیش آمد.' });
  }
};

// ویرایش دسته
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'دسته‌بندی پیدا نشد.' });

    category.name = name || category.name;
    category.description = description || category.description;
    await category.save();

    res.status(200).json({ message: 'دسته‌بندی ویرایش شد', category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'مشکلی در ویرایش دسته‌بندی پیش آمد.' });
  }
};

// حذف دسته
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'دسته‌بندی پیدا نشد.' });

    await category.destroy();
    res.status(200).json({ message: 'دسته‌بندی حذف شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'مشکلی در حذف دسته‌بندی پیش آمد.' });
  }
};
