import { z } from "zod";

/* ======================================================
   Mongo ObjectId Schema
====================================================== */
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");
