// backend/src/mappers/cart.mapper.ts
import type { Types } from "mongoose";

/* ======================================================
   Types (API Response Shape)
====================================================== */

export interface CartItemDTO {
  _id: string; // cart item id
  quantity: number;
  product: {
    _id: string;
    title: string;
    price: number;
    image?: string;
    stock: number;
  };
}

/* ======================================================
   Mapper
====================================================== */

export function mapCartItems(cart: any): CartItemDTO[] {
  if (!cart || !Array.isArray(cart.items)) {
    return [];
  }

  return cart.items
    .filter((item: any) => item.product) // 🔐 防止 product 被刪除
    .map((item: any) => {
      const product = item.product;

      return {
        _id: item._id.toString(),
        quantity: item.quantity,
        product: {
          _id: product._id.toString(),
          title: product.title,
          price: product.price,
          image: product.image || undefined,
          stock: product.stock,
        },
      };
    });
}
