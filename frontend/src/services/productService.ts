import type { Product } from "../types/Product";

/* ======================================================
   Config
====================================================== */

/**
 * 🔁 是否使用 mock API
 * - true  → 前端自跑（現在）
 * - false → 接 Express / MongoDB
 */
const USE_MOCK_API = true;

/**
 * Express API base
 * 未來只要後端有：
 *   app.use("/api/products", productsRouter)
 * 就能直接接
 */
const API_BASE_URL = "/api/products";

/* ======================================================
   Mock Store（僅 demo / 前端開發用）
====================================================== */

let mockProducts: Product[] = [];

/* ======================================================
   Helpers
====================================================== */

const delay = (ms = 600) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 將後端資料（MongoDB / Express）
 * 正規化成前端 Product
 */
const normalizeProduct = (raw: any): Product => ({
  id: raw.id ?? raw._id, // MongoDB _id 對齊 frontend
  title: raw.title,
  description: raw.description,
  price: Number(raw.price),
  image: raw.image,
  category: raw.category ?? "general",
  stock: Number(raw.stock ?? 0),
  createdAt:
    raw.createdAt ??
    new Date().toISOString(),
});

/* ======================================================
   APIs
====================================================== */

/**
 * GET /api/products
 */
export async function getProducts(): Promise<Product[]> {
  if (USE_MOCK_API) {
    await delay();
    return [...mockProducts];
  }

  const res = await fetch(API_BASE_URL);

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await res.json();
  return data.map(normalizeProduct);
}

/**
 * GET /api/products/:id
 */
export async function getProductById(
  id: string
): Promise<Product> {
  if (USE_MOCK_API) {
    await delay();
    const found = mockProducts.find(
      (p) => p.id === id
    );
    if (!found) {
      throw new Error("Product not found");
    }
    return found;
  }

  const res = await fetch(`${API_BASE_URL}/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  const data = await res.json();
  return normalizeProduct(data);
}

/**
 * POST /api/products
 * admin only
 */
export async function createProductAPI(
  product: Product
): Promise<Product> {
  if (USE_MOCK_API) {
    await delay();

    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    mockProducts.unshift(newProduct);
    return newProduct;
  }

  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!res.ok) {
    throw new Error("Failed to create product");
  }

  const data = await res.json();
  return normalizeProduct(data);
}

/**
 * PUT /api/products/:id
 * admin only
 */
export async function updateProductAPI(
  product: Product
): Promise<Product> {
  if (USE_MOCK_API) {
    await delay();

    mockProducts = mockProducts.map((p) =>
      p.id === product.id ? product : p
    );

    return product;
  }

  const res = await fetch(
    `${API_BASE_URL}/${product.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update product");
  }

  const data = await res.json();
  return normalizeProduct(data);
}

/**
 * DELETE /api/products/:id
 * admin only
 */
export async function deleteProductAPI(
  id: string
): Promise<void> {
  if (USE_MOCK_API) {
    await delay();
    mockProducts = mockProducts.filter(
      (p) => p.id !== id
    );
    return;
  }

  const res = await fetch(
    `${API_BASE_URL}/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete product");
  }
}
