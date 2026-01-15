import type { Product } from "../types/Product";

/* ======================================================
   Config
====================================================== */

/**
 * 🔁 是否使用 mock API
 * - true  → 前端自跑（demo / UI）
 * - false → 接 Express / MongoDB
 */
const USE_MOCK_API = false;

/**
 * Express API base
 * 對齊後端：
 * app.use("/api/products", productRouter)
 */
const API_BASE_URL = "http://localhost:4000/api/products";

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
  id: raw._id, // ✅ MongoDB ObjectId
  title: raw.title,
  description: raw.description ?? "",
  category: raw.category ?? "general",
  price: Number(raw.price),
  stock: Number(raw.stock ?? 0),
  image: raw.imageUrl ?? "", // ✅ 對齊後端 imageUrl
  createdAt: raw.createdAt,
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
  payload: Omit<Product, "id" | "createdAt">
): Promise<Product> {
  if (USE_MOCK_API) {
    await delay();

    const newProduct: Product = {
      ...payload,
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
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      category: payload.category,
      price: payload.price,
      stock: payload.stock,
      imageUrl: payload.image, // ✅ 對齊後端 schema
    }),
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
      body: JSON.stringify({
        title: product.title,
        description: product.description,
        category: product.category,
        price: product.price,
        stock: product.stock,
        imageUrl: product.image, // ✅ 對齊後端
      }),
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
