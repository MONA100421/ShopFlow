import { Router, Request, Response } from "express";

/* ======================================================
   Types（先定義型別，之後 MongoDB 直接沿用）
====================================================== */

interface Product {
  id: string;
  title: string;
  price: number;
  stock: number;
  image?: string;
  description?: string;
  createdAt: string;
}

/* ======================================================
   Router
====================================================== */

const router = Router();

/**
 * ✅ 暫時用的假資料（之後會換成 MongoDB）
 * ⚠️ 結構已對齊前端 Product type
 */
const mockProducts: Product[] = [
  {
    id: "p1",
    title: "Wireless Headphones",
    price: 129.99,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1518441902117-f63bcbe3d8f8",
    description: "High quality wireless headphones",
    createdAt: new Date().toISOString(),
  },
  {
    id: "p2",
    title: "Mechanical Keyboard",
    price: 89.99,
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    description: "RGB mechanical keyboard",
    createdAt: new Date().toISOString(),
  },
  {
    id: "p3",
    title: "Gaming Mouse",
    price: 49.99,
    stock: 0,
    image:
      "https://images.unsplash.com/photo-1584270354949-1b3b3c48e5b3",
    description: "High precision gaming mouse",
    createdAt: new Date().toISOString(),
  },
];

/* ======================================================
   GET /api/products
   👉 取得所有商品
====================================================== */
router.get("/", (_req: Request, res: Response) => {
  res.json(mockProducts);
});

/* ======================================================
   GET /api/products/:id
   👉 取得單一商品
====================================================== */
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const product = mockProducts.find(
    (item) => item.id === id
  );

  if (!product) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  res.json(product);
});

/* ======================================================
   POST /api/products
   👉 新增商品（暫時只存在記憶體）
====================================================== */
router.post("/", (req: Request, res: Response) => {
  const {
    title,
    price,
    stock,
    image,
    description,
  } = req.body as Partial<Product>;

  if (
    !title ||
    typeof price !== "number" ||
    typeof stock !== "number"
  ) {
    return res.status(400).json({
      error: "Invalid product data",
    });
  }

  const newProduct: Product = {
    id: `p${Date.now()}`,
    title,
    price,
    stock,
    image,
    description,
    createdAt: new Date().toISOString(),
  };

  mockProducts.push(newProduct);

  res.status(201).json(newProduct);
});

/* ======================================================
   PUT /api/products/:id
   👉 更新商品（暫時只改記憶體）
====================================================== */
router.put("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const index = mockProducts.findIndex(
    (item) => item.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  mockProducts[index] = {
    ...mockProducts[index],
    ...req.body,
  };

  res.json(mockProducts[index]);
});

/* ======================================================
   DELETE /api/products/:id
   👉 刪除商品
====================================================== */
router.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const index = mockProducts.findIndex(
    (item) => item.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  const [deletedProduct] = mockProducts.splice(
    index,
    1
  );

  res.json(deletedProduct);
});

export default router;
