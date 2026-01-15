import mongoose from "mongoose";
import Product, { IProduct } from "../models/Product.model";

/* ======================================================
   Types
====================================================== */

type CreateProductInput = Partial<IProduct>;
type UpdateProductInput = Partial<IProduct>;

/* ======================================================
   Get all active products
====================================================== */
export const getAllProducts = async (): Promise<IProduct[]> => {
  return Product.find({ isActive: true }).sort({ createdAt: -1 });
};

/* ======================================================
   Get product by id
====================================================== */
export const getProductById = async (
  productId: string
): Promise<IProduct | null> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return null;
  }

  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    return null;
  }

  return product;
};

/* ======================================================
   Create product
====================================================== */
export const createProduct = async (
  data: CreateProductInput
): Promise<IProduct> => {
  const product = new Product(data);
  return product.save();
};

/* ======================================================
   Update product
====================================================== */
export const updateProduct = async (
  productId: string,
  data: UpdateProductInput
): Promise<IProduct | null> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return null;
  }

  return Product.findByIdAndUpdate(
    productId,
    { $set: data },
    {
      new: true,
      runValidators: true,
    }
  );
};

/* ======================================================
   Soft delete product (isActive = false)
====================================================== */
export const deleteProduct = async (
  productId: string
): Promise<IProduct | null> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return null;
  }

  return Product.findByIdAndUpdate(
    productId,
    { isActive: false },
    { new: true }
  );
};
