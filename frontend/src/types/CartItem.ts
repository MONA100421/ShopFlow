// src/types/CartItem.ts

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  subtotal: number; // ✅ 後端已計算好
}
