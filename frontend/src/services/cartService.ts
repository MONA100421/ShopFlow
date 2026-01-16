// frontend/src/services/cartService.ts
import type { CartItem } from "../types/CartItem";

const API_BASE_URL = "http://localhost:4000/api/cart";

export async function fetchCartAPI(): Promise<CartItem[]> {
  const res = await fetch(API_BASE_URL, {
    credentials: "include", // 🔥 必須
  });
  if (!res.ok) throw new Error("Fetch cart failed");
  return res.json();
}

export async function addToCartAPI(
  productId: string,
  quantity: number
): Promise<CartItem[]> {
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 🔥 必須
    body: JSON.stringify({ productId, quantity }),
  });

  if (!res.ok) throw new Error("Add to cart failed");
  return res.json();
}

export async function updateCartQuantityAPI(
  productId: string,
  delta: 1 | -1
): Promise<CartItem[]> {
  const res = await fetch(`${API_BASE_URL}/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 🔥
    body: JSON.stringify({ delta }),
  });

  if (!res.ok) throw new Error("Update quantity failed");
  return res.json();
}

export async function removeFromCartAPI(
  productId: string
): Promise<CartItem[]> {
  const res = await fetch(`${API_BASE_URL}/${productId}`, {
    method: "DELETE",
    credentials: "include", // 🔥
  });

  if (!res.ok) throw new Error("Remove item failed");
  return res.json();
}

export async function clearCartAPI(): Promise<void> {
  const res = await fetch(API_BASE_URL, {
    method: "DELETE",
    credentials: "include", // 🔥
  });

  if (!res.ok) throw new Error("Clear cart failed");
}
