// frontend/src/services/cartService.ts
import type { CartItem } from "../types/CartItem";

const API_BASE_URL = "http://localhost:4000/api/cart";

/* ================= Helpers ================= */

async function handleResponse(res: Response) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Cart API error");
  }
  const data = await res.json();
  return data.items as CartItem[];
}

/* ================= APIs ================= */

export async function fetchCartAPI(): Promise<CartItem[]> {
  const res = await fetch(API_BASE_URL, {
    credentials: "include",
  });
  return handleResponse(res);
}

export async function addToCartAPI(
  productId: string,
  quantity: number
): Promise<CartItem[]> {
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ productId, quantity }),
  });

  return handleResponse(res);
}

export async function updateCartQuantityAPI(
  productId: string,
  delta: 1 | -1
): Promise<CartItem[]> {
  const res = await fetch(`${API_BASE_URL}/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ delta }),
  });

  return handleResponse(res);
}

export async function removeFromCartAPI(
  productId: string
): Promise<CartItem[]> {
  const res = await fetch(`${API_BASE_URL}/${productId}`, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse(res);
}

export async function clearCartAPI(): Promise<CartItem[]> {
  const res = await fetch(API_BASE_URL, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse(res);
}
