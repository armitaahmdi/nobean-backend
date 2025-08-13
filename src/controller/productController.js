const db = require('../model/index');
const { Product, Category } = db;

// گرفتن همه محصولات
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category }],
      order: [['createdAt', 'DESC']]
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// گرفتن یک محصول با جزئیات
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }]
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ایجاد محصول جدید (ادمین)
exports.createProduct = async (req, res) => {
  try {
    const { name, price, count, description, imageUrl, discount, categoryId } = req.body;
    const newProduct = await Product.create({
      name,
      price,
      count,
      description,
      imageUrl,
      discount,
      categoryId
    });
    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ویرایش محصول (ادمین)
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, count, description, imageUrl, discount, categoryId } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.update({ name, price, count, description, imageUrl, discount, categoryId });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// حذف محصول (ادمین)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
