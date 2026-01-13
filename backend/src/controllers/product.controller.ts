import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.model";

/* ======================================================
   GET /api/products
====================================================== */
export const getAllProducts = async (
  _req: Request,
  res: Response
) => {
  try {
    const products = await Product.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (error) {
    console.error("getAllProducts error:", error);
    res.status(500).json({
      error: "Failed to fetch products",
    });
  }
};

/* ======================================================
   GET /api/products/:id
====================================================== */
export const getProductById = async (
  req: Request,
  res: Response
) => {
  const id = req.params.id as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: "Invalid product id",
    });
  }

  try {
    const product = await Product.findById(id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    console.error("getProductById error:", error);
    res.status(500).json({
      error: "Failed to fetch product",
    });
  }
};

/* ======================================================
   POST /api/products
====================================================== */
export const createProduct = async (
  req: Request,
  res: Response
) => {
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
====================================================== */
export const updateProduct = async (
  req: Request,
  res: Response
) => {
  const id = req.params.id as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: "Invalid product id",
    });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({
      error: "Failed to update product",
    });
  }
};

/* ======================================================
   DELETE /api/products/:id (Soft Delete)
====================================================== */
export const deleteProduct = async (
  req: Request,
  res: Response
) => {
  const id = req.params.id as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: "Invalid product id",
    });
  }

  try {
    const deletedProduct = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!deletedProduct) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.json(deletedProduct);
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({
      error: "Failed to delete product",
    });
  }
};
