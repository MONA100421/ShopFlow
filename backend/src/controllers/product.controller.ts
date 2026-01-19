import { Request, Response } from "express";
import * as productService from "../services/product.service";

// GET /api/products
export const getAllProducts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error("getAllProducts error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// GET /api/products/:id
export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = String(req.params.id);

  try {
    const product = await productService.getProductById(id);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("getProductById error:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// POST /api/products
export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error("createProduct error:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// PUT /api/products/:id
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = String(req.params.id);

  try {
    const product = await productService.updateProduct(id, req.body);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = String(req.params.id);

  try {
    const product = await productService.deleteProduct(id);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};
