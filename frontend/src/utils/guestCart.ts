import type { CartItem } from "../types/CartItem";

const STORAGE_KEY = "guest_cart";

function save(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

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

export function clearGuestCart() {
  localStorage.removeItem(STORAGE_KEY);
}

/* Mutations*/

export function addToGuestCart(item: CartItem): CartItem[] {
  const cart = getGuestCart();
  const existing = cart.find(
    (i) => i.productId === item.productId
  );

  if (existing) {
    existing.quantity += item.quantity;
    existing.subtotal =
      existing.price * existing.quantity;
  } else {
    cart.push(item);
  }

  save(cart);
  return cart;
}

export function updateGuestCartQuantity(
  productId: string,
  delta: 1 | -1
): CartItem[] {
  const cart = getGuestCart();
  const item = cart.find(
    (i) => i.productId === productId
  );

  if (!item) return cart;

  item.quantity += delta;

  if (item.quantity <= 0) {
    return removeFromGuestCart(productId);
  }

  item.subtotal = item.price * item.quantity;
  save(cart);
  return cart;
}

export function removeFromGuestCart(
  productId: string
): CartItem[] {
  const cart = getGuestCart().filter(
    (i) => i.productId !== productId
  );
  save(cart);
  return cart;
}
