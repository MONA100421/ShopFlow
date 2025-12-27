import type { Product } from "../types/Product";

const STORAGE_KEY = "products";

export function getProducts(): Product[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id);
}

export function createProduct(product: Product) {
  const products = getProducts();
  products.push(product);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function updateProduct(updated: Product) {
  const products = getProducts().map((p) =>
    p.id === updated.id ? updated : p
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function deleteProduct(id: string) {
  const products = getProducts().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}
