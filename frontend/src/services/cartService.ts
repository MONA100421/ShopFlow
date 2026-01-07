import type { CartItem } from "../types/CartItem";
import type { Product } from "../types/Product";

/* ======================================================
   Config
====================================================== */

// 🔁 之後接 Express 只改這一行
const USE_MOCK_API = true;

// 未來 Express Cart API base
const API_BASE_URL = "/api/cart";

/* ======================================================
   Mock Cart Store（模擬 DB）
====================================================== */

/**
 * 在 mock 模式下：
 * - 每個 user 會有一個 cart
 * - 這裡先用單一 cart（課堂 / demo 足夠）
 */
let mockCart: CartItem[] = [];

/* ======================================================
   Helpers
====================================================== */

const delay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* ======================================================
   APIs
====================================================== */

/**
 * GET /api/cart
 * 取得目前使用者 cart
 */
export async function fetchCartAPI(): Promise<CartItem[]> {
  if (USE_MOCK_API) {
    await delay();
    return [...mockCart];
  }

  const res = await fetch(API_BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch cart");
  }

  return res.json();
}

/**
 * POST /api/cart
 * 新增 / 合併商品到 cart
 */
export async function addToCartAPI(
  product: Product,
  quantity: number
): Promise<CartItem[]> {
  if (USE_MOCK_API) {
    await delay();

    if (product.stock <= 0) {
      return mockCart;
    }

    const existing = mockCart.find(
      (item) => item.product.id === product.id
    );

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + quantity,
        product.stock
      );
    } else {
      mockCart.push({
        product,
        quantity: Math.min(quantity, product.stock),
      });
    }

    return [...mockCart];
  }

  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId: product.id, quantity }),
  });

  if (!res.ok) {
    throw new Error("Failed to add to cart");
  }

  return res.json();
}

/**
 * PUT /api/cart
 * 更新商品數量（+1 / -1）
 */
export async function updateCartQuantityAPI(
  productId: string,
  delta: 1 | -1
): Promise<CartItem[]> {
  if (USE_MOCK_API) {
    await delay();

    mockCart = mockCart.map((item) => {
      if (item.product.id !== productId) {
        return item;
      }

      const nextQty =
        delta === 1
          ? Math.min(
              item.quantity + 1,
              item.product.stock
            )
          : Math.max(item.quantity - 1, 1);

      return { ...item, quantity: nextQty };
    });

    return [...mockCart];
  }

  const res = await fetch(API_BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, delta }),
  });

  if (!res.ok) {
    throw new Error("Failed to update cart quantity");
  }

  return res.json();
}

/**
 * DELETE /api/cart/:productId
 * 移除單一商品
 */
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

  if (!res.ok) {
    throw new Error("Failed to remove item from cart");
  }

  return res.json();
}

/**
 * DELETE /api/cart
 * 清空 cart
 */
export async function clearCartAPI(): Promise<void> {
  if (USE_MOCK_API) {
    await delay();
    mockCart = [];
    return;
  }

  const res = await fetch(API_BASE_URL, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to clear cart");
  }
}
