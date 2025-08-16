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
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ user_id: req.user.id });
    }

    let cartItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id: productId }
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id: productId,
        quantity
      });
    }

    res.status(201).json({ message: "محصول به سبد اضافه شد", cartItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
