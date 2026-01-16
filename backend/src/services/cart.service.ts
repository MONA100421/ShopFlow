// backend/src/services/cart.service.ts
import mongoose from "mongoose";
import Cart from "../models/Cart.model";
import Product from "../models/Product.model";

/* ======================================================
   Helpers
====================================================== */

const populateCart = async (cart: any) => {
  await cart.populate("items.product");
  return cart;
};

const getOrCreateCart = async (userId: string) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  return populateCart(cart);
};

const findItemByProductId = (
  cart: any,
  productId: string
) =>
  cart.items.find(
    (i: any) => i.product.toString() === productId
  );

/* ======================================================
   Get cart items
====================================================== */
export const getCartItems = async (userId: string) => {
  const cart = await getOrCreateCart(userId);
  return cart.items;
};

/* ======================================================
   Add to cart
====================================================== */
export const addToCart = async (
  userId: string,
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

  const cart = await getOrCreateCart(userId);
  const item = findItemByProductId(cart, productId);

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
  await populateCart(cart);

  return cart.items;
};

/* ======================================================
   Update cart item
====================================================== */
export const updateCartItem = async (
  userId: string,
  productId: string,
  delta: 1 | -1
) => {
  const cart = await getOrCreateCart(userId);
  const item = findItemByProductId(cart, productId);

  if (!item) {
    throw new Error("Cart item not found");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart.items.pull({ product: item.product });
  } else {
    item.quantity = Math.min(item.quantity, product.stock);
  }

  await cart.save();
  await populateCart(cart);

  return cart.items;
};

/* ======================================================
   Remove item
====================================================== */
export const removeCartItem = async (
  userId: string,
  productId: string
) => {
  const cart = await getOrCreateCart(userId);

  cart.items.pull({ product: productId });

  await cart.save();
  await populateCart(cart);

  return cart.items;
};

/* ======================================================
   Clear cart
====================================================== */
export const clearCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);

  cart.items.splice(0); // ✅ 正確清空方式

  await cart.save();
  await populateCart(cart);

  return cart.items;
};
