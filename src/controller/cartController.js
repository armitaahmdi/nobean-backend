const db = require('../model/index');
const Cart = db.Cart;
const CartItem = db.CartItem;
const Product = db.Product;

// گرفتن سبد خرید کاربر
exports.getUserCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: {
        model: CartItem,
        include: Product
      }
    });

    if (!cart) return res.status(200).json({ cart: [], totalPrice: 0 });

    const totalPrice = cart.CartItems.reduce((sum, item) => {
      const price = item.Product.price * item.quantity;
      return sum + price;
    }, 0);

    res.status(200).json({ cart: cart.CartItems, totalPrice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// اضافه کردن محصول به سبد خرید

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id; // از verifyToken میاد
    const { product_id, quantity } = req.body;

    // پیدا کردن یا ساختن Cart برای کاربر
    let cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      cart = await Cart.create({ user_id: userId });
    }

    // چک کنیم آیا این محصول قبلا توی سبد هست؟
    let cartItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id }
    });

    if (cartItem) {
      // اگه بود تعدادشو زیاد کن
      cartItem.quantity += quantity || 1;
      await cartItem.save();
    } else {
      // اگه نبود ایجادش کن
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id,
        quantity: quantity || 1
      });
    }

    res.status(201).json({
      message: "محصول به سبد خرید اضافه شد",
      cartItem
    });
  } catch (err) {
    console.error("خطا در اضافه کردن محصول به سبد خرید:", err);
    res.status(500).json({ error: "مشکلی در اضافه کردن محصول پیش آمد" });
  }
};


// ویرایش تعداد آیتم
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await CartItem.findByPk(id);
    if (!cartItem) return res.status(404).json({ message: "آیتم پیدا نشد" });

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ message: "تعداد آیتم بروز شد", cartItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف یک آیتم
exports.removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CartItem.destroy({ where: { id: id } });

    if (!deleted) return res.status(404).json({ message: "آیتم پیدا نشد" });

    res.status(200).json({ message: "آیتم حذف شد" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// خالی کردن کل سبد
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) return res.status(404).json({ message: "سبد خرید پیدا نشد" });

    await CartItem.destroy({ where: { cart_id: cart.id } });
    res.status(200).json({ message: "کل سبد خرید خالی شد" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
