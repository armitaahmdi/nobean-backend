const db = require('../model/index');
const { Product, Category } = db;


// گرفتن همه محصولات با pagination
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      include: [{ model: Category, as: 'categories' }],
      order: [['createdAt', 'DESC']],
      limit: +limit,
      offset: +offset
    });

    if (rows.length === 0) {
      return res.status(404).json({ message: "هیچ محصولی یافت نشد." });
    }

    res.status(200).json({
      total: count,          // تعداد کل محصولات
      currentPage: +page,    // شماره صفحه فعلی
      totalPages: Math.ceil(count / limit), // تعداد کل صفحات
      count: rows.length,    // تعداد محصولات در همین صفحه
      products: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};



// گرفتن یک محصول با جزئیات
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // اعتبارسنجی ورودی
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findByPk(id, {
      include: [{ model: Category, as: 'categories' }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ایجاد محصول جدید (ادمین)
exports.createProduct = async (req, res) => {
  try {
    const { name, price, count, description, imageUrl, discount, categoryId } = req.body;

    // ۱. بررسی فیلدهای ضروری
    if (!name || !price || !count || !categoryId) {
      return res.status(400).json({ 
        message: 'لطفاً فیلدهای name, price, count و categoryId را وارد کنید.' 
      });
    }

    // ۲. بررسی اینکه categoryId معتبره
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'دسته‌بندی وارد شده معتبر نیست.' });
    }

    // ۳. ساخت محصول بدون categoryId
    const newProduct = await Product.create({
      name,
      price,
      count,
      description: description || '',
      imageUrl: imageUrl || '',
      discount: discount || 0
    });

    // ۴. وصل کردن محصول به دسته‌بندی
    await newProduct.addCategory(categoryId); // اگه چند دسته داری: addCategories([1,2,3])

    // ۵. گرفتن محصول همراه دسته‌بندی‌ها
    const productWithCategory = await Product.findByPk(newProduct.id, {
      include: [{ model: Category, as: 'categories' }]
    });

    // ۶. پاسخ موفقیت
    return res.status(201).json({
      message: 'محصول با موفقیت ایجاد شد.',
      product: productWithCategory
    });

  } catch (err) {
    console.error('خطا در ایجاد محصول:', err);
    return res.status(500).json({ message: 'خطای سرور، لطفاً دوباره تلاش کنید.' });
  }
};


// ویرایش محصول (ادمین)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const { name, price, count, description, imageUrl, discount, categoryId } = req.body;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // آماده‌سازی داده‌های آپدیت (به جز categoryId)
    const updatedData = {};
    if (name) updatedData.name = name;
if (price !== undefined) updatedData.price = price;

    if (count) updatedData.count = count;
    if (description) updatedData.description = description;
    if (imageUrl) updatedData.imageUrl = imageUrl;
    if (discount) updatedData.discount = discount;

    // آپدیت اطلاعات محصول
    await product.update(updatedData);

    // اگر categoryId ارسال شد → دسته‌بندی رو ست کن
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Invalid categoryId' });
      }
      await product.setCategories([categoryId]); // جدول واسطه رو آپدیت می‌کنه
    }

    // گرفتن محصول همراه با دسته‌بندی
    const updatedProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'categories' }]
    });

    res.status(200).json({message:"آپدیت با موفقیت انجام شد ",product:updatedProduct});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};



// حذف محصول (ادمین)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // اعتبارسنجی ورودی
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const deletedProduct = product.toJSON();
    await product.destroy();

    res.status(200).json({
      message: 'Product deleted successfully',
      product: deletedProduct
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// آپدیت جزئی محصول (PATCH)
exports.patchProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // اعتبارسنجی ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const { name, price, count, description, imageUrl, discount, categoryId } = req.body;

    // پیدا کردن محصول
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // آماده‌سازی داده‌های آپدیت (فقط فیلدهای موجود)
    const updatedData = {};
    if (name !== undefined) updatedData.name = name;
    if (price !== undefined) updatedData.price = price;
    if (count !== undefined) updatedData.count = count;
    if (description !== undefined) updatedData.description = description;
    if (imageUrl !== undefined) updatedData.imageUrl = imageUrl;
    if (discount !== undefined) updatedData.discount = discount;

    // اگر هیچ فیلدی نیومده بود
    if (Object.keys(updatedData).length === 0 && !categoryId) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    // آپدیت محصول
    await product.update(updatedData);

    // اگر categoryId اومد، دسته‌بندی‌ها رو ست کن
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Invalid categoryId' });
      }
      await product.setCategories([categoryId]);
    }

    // گرفتن محصول نهایی همراه دسته‌بندی‌ها
    const patchedProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'categories' }]
    });

    res.status(200).json({message:"آپدیت با موفقیت انجام شد ",product:patchedProduct});

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

