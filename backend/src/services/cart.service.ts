// src/services/cart.service.ts
import mongoose from "mongoose";
import Cart from "../models/Cart.model";
import Product from "../models/Product.model";

/* ======================================================
   Helpers
====================================================== */

const getCart = async () => {
  let cart = await Cart.findOne().populate("items.product");

  if (!cart) {
    cart = await Cart.create({ items: [] });
  }

  return cart;
};

/* ======================================================
   Get cart
====================================================== */

export const getCartItems = async () => {
  const cart = await getCart();
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

  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    throw new Error("Product not found");
  }

  const cart = await getCart();

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity = Math.min(
      existingItem.quantity + quantity,
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
   Update quantity
====================================================== */

export const updateCartItem = async (
  productId: string,
  delta: 1 | -1
) => {
  const cart = await getCart();

  const item = cart.items.find(
    (i) => i.product.toString() === productId
  );

  if (!item) {
    throw new Error("Cart item not found");
  }

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId
    );
  }

  await cart.save();
  await cart.populate("items.product");

  return cart.items;
};

/* ======================================================
   Remove item
====================================================== */

export const removeCartItem = async (productId: string) => {
  const cart = await getCart();

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
  const cart = await getCart();
  cart.items = [];
  await cart.save();
  return [];
};
