// frontend/src/utils/guestCart.ts
import type { CartItem } from "../types/CartItem";

const STORAGE_KEY = "guest_cart";

/**
 * 取得 guest cart
 */
export function getGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * 儲存 guest cart
 */
function saveGuestCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * 加入商品
 */
export function addToGuestCart(
  item: CartItem
): CartItem[] {
  const items = getGuestCart();

  const existing = items.find(
    (i) => i.productId === item.productId
  );

  if (existing) {
    existing.quantity += item.quantity;
    existing.subtotal =
      existing.quantity * (item.subtotal / item.quantity);
  } else {
    items.push(item);
  }

  saveGuestCart(items);
  return items;
}

/**
 * 更新數量
 */
export function updateGuestCartQuantity(
  productId: string,
  delta: 1 | -1
): CartItem[] {
  const items = getGuestCart();

  const target = items.find(
    (i) => i.productId === productId
  );

  if (!target) return items;

  target.quantity += delta;

  if (target.quantity <= 0) {
    return removeFromGuestCart(productId);
  }

  target.subtotal =
    (target.subtotal / (target.quantity - delta)) *
    target.quantity;

  saveGuestCart(items);
  return items;
}

/**
 * 移除商品
 */
export function removeFromGuestCart(
  productId: string
): CartItem[] {
  const items = getGuestCart().filter(
    (i) => i.productId !== productId
  );

  saveGuestCart(items);
  return items;
}

/**
 * 清空 guest cart
 */
export function clearGuestCart() {
  localStorage.removeItem(STORAGE_KEY);
}
