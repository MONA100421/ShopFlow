// src/services/cart.service.ts
import mongoose from "mongoose";
import Cart from "../models/Cart.model";
import Product from "../models/Product.model";

/* ======================================================
   Internal helper: get or create cart
   （目前單一 cart，未來可接 user）
====================================================== */
const getOrCreateCart = async () => {
  let cart = await Cart.findOne().populate("items.product");

  if (!cart) {
    cart = await Cart.create({ items: [] });
    await cart.populate("items.product");
  }

  return cart;
};

/* ======================================================
   Get cart items
====================================================== */
export const getCartItems = async () => {
  const cart = await getOrCreateCart();
  return cart.items;
};

/* ======================================================
   Add to cart
====================================================== */
export const addToCart = async (
  productId: string,
  quantity: number
) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product id");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Invalid quantity");
  }

  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    throw new Error("Product not found");
  }

  const cart = await getOrCreateCart();

  const item = cart.items.find(
    (i) => i.product.toString() === productId
  );

  if (item) {
    item.quantity = Math.min(
      item.quantity + quantity,
      product.stock
    );
  } else {
    cart.items.push({
      product: product._id,
      quantity: Math.min(quantity, product.stock),
    });
  }

  await cart.save();
  await cart.populate("items.product");

  return cart.items;
};

/* ======================================================
   Update cart item quantity (+1 / -1)
====================================================== */
export const updateCartItem = async (
  productId: string,
  delta: 1 | -1
) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product id");
  }

  if (delta !== 1 && delta !== -1) {
    throw new Error("Invalid delta");
  }

  const cart = await getOrCreateCart();

  const item = cart.items.find(
    (i) => i.product.toString() === productId
  );

  if (!item) {
    throw new Error("Cart item not found");
  }

  const product = await Product.findById(item.product);

  if (!product) {
    throw new Error("Product not found");
  }

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId
    );
  } else {
    item.quantity = Math.min(item.quantity, product.stock);
  }

  await cart.save();
  await cart.populate("items.product");

  return cart.items;
};

/* ======================================================
   Remove item from cart
====================================================== */
export const removeCartItem = async (productId: string) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product id");
  }

  const cart = await getOrCreateCart();

  cart.items = cart.items.filter(
    (i) => i.product.toString() !== productId
  );

  await cart.save();
  await cart.populate("items.product");

  return cart.items;
};

/* ======================================================
   Clear cart
====================================================== */
export const clearCart = async () => {
  const cart = await getOrCreateCart();
  cart.items = [];
  await cart.save();
  return [];
};
