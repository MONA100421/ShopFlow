import { z } from "zod";
import { objectIdSchema } from "./common.validation";

// Get Product By Id
export const getProductByIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

// Create Product
export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(120),
    description: z.string().max(1000).optional(),
    price: z.number().positive(),
    category: z.string().min(1),
    stock: z.number().int().min(0),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().optional(),
  }),
});

// Update Product
export const updateProductSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
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

// Delete Product
export const deleteProductSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
