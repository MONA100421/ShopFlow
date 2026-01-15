import { z } from "zod";

/**
 * MongoDB ObjectId validation
 */
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, {
    message: "Invalid ObjectId format",
  });
