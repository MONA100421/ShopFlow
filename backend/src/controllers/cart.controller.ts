import { Request, Response } from "express";
import * as cartService from "../services/cart.service";
import { mapCartItems } from "../mappers/cart.mapper";

// GET /api/cart
export const getCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.json({ items: [] });
      return;
    }

    const userId = req.user.id;
    const items = await cartService.getCartItems(userId);

    res.json(mapCartItems({ items }));
  } catch (err) {
    console.error("getCart error:", err);
    res.status(500).json({
      error: "Failed to fetch cart",
    });
  }
};

// POST /api/cart
export const addToCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productId, quantity } = req.body as {
    productId?: string;
    quantity?: number;
  };

  if (!productId || typeof quantity !== "number") {
    res.status(400).json({
      error: "Invalid cart payload",
    });
    return;
  }

  try {
    const userId = req.user!.id;

    const items = await cartService.addToCart(
      userId,
      productId,
      quantity
    );

    res.status(201).json(
      mapCartItems({ items })
    );
  } catch (err: any) {
    res.status(400).json({
      error:
        err.message ??
        "Failed to add item to cart",
    });
  }
};

// PUT /api/cart/:productId
export const updateCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const productId = String(req.params.productId);
  const { delta } = req.body as {
    delta?: 1 | -1;
  };

  if (delta !== 1 && delta !== -1) {
    res.status(400).json({
      error: "Delta must be 1 or -1",
    });
    return;
  }

  try {
    const userId = req.user!.id;

    const items =
      await cartService.updateCartItem(
        userId,
        productId,
        delta
      );

    res.json(
      mapCartItems({ items })
    );
  } catch (err: any) {
    res.status(400).json({
      error:
        err.message ??
        "Failed to update cart item",
    });
  }
};

// DELETE /api/cart/:productId
export const deleteCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const productId = String(req.params.productId);

  try {
    const userId = req.user!.id;

    const items =
      await cartService.removeCartItem(
        userId,
        productId
      );

    res.json(
      mapCartItems({ items })
    );
  } catch (err: any) {
    res.status(400).json({
      error:
        err.message ??
        "Failed to remove cart item",
    });
  }
};

// DELETE /api/cart
export const clearCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const items =
      await cartService.clearCart(userId);

    res.json(
      mapCartItems({ items })
    );
  } catch {
    res.status(500).json({
      error: "Failed to clear cart",
    });
  }
};

// POST /api/cart/merge
export const mergeCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { items } = req.body as {
      items?: { productId: string; quantity: number }[];
    };

    if (!Array.isArray(items)) {
      res.status(400).json({
        error: "Invalid merge payload",
      });
      return;
    }

    const merged =
      await cartService.mergeCartItems(
        userId,
        items
      );

    res.json(mapCartItems({ items: merged }));
  } catch (err) {
    console.error("mergeCart error:", err);
    res.status(500).json({
      error: "Failed to merge cart",
    });
  }
};
