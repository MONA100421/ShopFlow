import type { Product } from "./Product";

export interface CartItem {
  _id: string;          // ⭐ cart item id（後端來的）
  product: Product & {
    _id: string;        // ⭐ Mongo id（只在 cart 用）
  };
  quantity: number;
}
