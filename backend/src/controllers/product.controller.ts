import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.model";

/* ======================================================
   GET /api/products
   Get all active products
====================================================== */
export const getAllProducts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await Product.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("getAllProducts error:", error);
    res.status(500).json({
      error: "Failed to fetch products",
    });
  }
};

/* ======================================================
   GET /api/products/:id
   Get single product by id
====================================================== */
export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = String(req.params.id);

  try {
    const product = await Product.findById(id);

    if (!product || !product.isActive) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("getProductById error:", error);
    res.status(500).json({
      error: "Failed to fetch product",
    });
  }
};

/* ======================================================
   POST /api/products
   Create new product (Admin)
====================================================== */
export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("createProduct error:", error);
    res.status(500).json({
      error: "Failed to create product",
    });
  }
};

/* ======================================================
   PUT /api/products/:id
   Update product (Admin)
====================================================== */
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = String(req.params.id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({
      error: "Failed to update product",
    });
  }
};

/* ======================================================
   DELETE /api/products/:id
   Soft delete product (isActive = false)
====================================================== */
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = String(req.params.id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  try {
    const deletedProduct = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!deletedProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.status(200).json(deletedProduct);
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({
      error: "Failed to delete product",
    });
  }
};
