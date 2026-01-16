// src/controllers/cart.controller.ts
import { Request, Response } from "express";
import * as cartService from "../services/cart.service";

/* ======================================================
   GET /api/cart
====================================================== */
export const getCart = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const items = await cartService.getCartItems();
    res.json(items);
  } catch {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

/* ======================================================
   POST /api/cart
   body: { productId: string, quantity: number }
====================================================== */
export const addToCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productId, quantity } = req.body as {
    productId?: string;
    quantity?: number;
  };

  if (!productId || typeof quantity !== "number") {
    res.status(400).json({ error: "Invalid cart payload" });
    return;
  }

  try {
    const items = await cartService.addToCart(
      productId,
      quantity
    );
    res.status(201).json(items);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/* ======================================================
   PUT /api/cart/:productId
   body: { delta: 1 | -1 }
====================================================== */
export const updateCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const productId = String(req.params.productId);
  const { delta } = req.body as { delta?: 1 | -1 };

  if (delta !== 1 && delta !== -1) {
    res.status(400).json({ error: "Delta must be 1 or -1" });
    return;
  }

  try {
    const items = await cartService.updateCartItem(
      productId,
      delta
    );
    res.json(items);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/* ======================================================
   DELETE /api/cart/:productId
====================================================== */
export const deleteCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const productId = String(req.params.productId);

  try {
    const items = await cartService.removeCartItem(productId);
    res.json(items);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/* ======================================================
   DELETE /api/cart
====================================================== */
export const clearCart = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const items = await cartService.clearCart();
  res.json(items);
};
