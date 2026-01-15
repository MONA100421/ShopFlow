import { z } from "zod";

/* ======================================================
   Create Product
====================================================== */
export const createProductSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(120, "Title is too long"),

    description: z
      .string()
      .max(1000, "Description is too long")
      .optional(),

    price: z
      .number()
      .positive("Price must be greater than 0"),

    category: z
      .string()
      .min(1, "Category is required"),

    stock: z
      .number()
      .int("Stock must be an integer")
      .min(0, "Stock cannot be negative"),

    imageUrl: z.string().url().optional(),

    isActive: z.boolean().optional(),
  }),
});

/* ======================================================
   Update Product（partial）
====================================================== */
export const updateProductSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(120).optional(),
    description: z.string().max(1000).optional(),
    price: z.number().positive().optional(),
    category: z.string().min(1).optional(),
    stock: z.number().int().min(0).optional(),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().optional(),
  }),
});
