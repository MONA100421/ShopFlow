import type { CartItem } from "../types/CartItem";
import type { Product } from "../types/Product";

/* ======================================================
   Config
====================================================== */

const USE_MOCK_API = false;
const API_BASE_URL = "http://localhost:4000/api/cart";

/* ======================================================
   Mock（僅 demo）
====================================================== */

let mockCart: CartItem[] = [];

const delay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* ======================================================
   APIs
====================================================== */

export async function fetchCartAPI(): Promise<CartItem[]> {
  if (USE_MOCK_API) {
    await delay();
    return [...mockCart];
  }

  const res = await fetch(API_BASE_URL);
  if (!res.ok) throw new Error("Fetch cart failed");
  return res.json();
}

export async function addToCartAPI(
  product: Product,
  quantity: number
): Promise<CartItem[]> {
  if (USE_MOCK_API) {
    await delay();
    const existing = mockCart.find(
      (i) => i.product.id === product.id
    );
    if (existing) existing.quantity += quantity;
    else mockCart.push({ product, quantity });
    return [...mockCart];
  }

  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: product.id,
      quantity,
     }),
  });

  if (!res.ok) throw new Error("Add to cart failed");
  return res.json();
}

export async function updateCartQuantityAPI(
  productId: string,
  delta: 1 | -1
): Promise<CartItem[]> {
  if (USE_MOCK_API) {
    await delay();
    mockCart = mockCart.map((item) =>
      item.product.id === productId
        ? { ...item, quantity: item.quantity + delta }
        : item
    );
    return [...mockCart];
  }

  const res = await fetch(`${API_BASE_URL}/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ delta }),
  });

  if (!res.ok) throw new Error("Update quantity failed");
  return res.json();
}

export async function removeFromCartAPI(
  productId: string
): Promise<CartItem[]> {
  if (USE_MOCK_API) {
    await delay();
    mockCart = mockCart.filter(
      (item) => item.product.id !== productId
    );
    return [...mockCart];
  }

  const res = await fetch(`${API_BASE_URL}/${productId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Remove item failed");
  return res.json();
}

export async function clearCartAPI(): Promise<void> {
  if (USE_MOCK_API) {
    await delay();
    mockCart = [];
    return;
  }

  const res = await fetch(API_BASE_URL, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Clear cart failed");
}
