import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { validate } from "../middlewares/validate";
import {
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
  deleteProductSchema,
} from "../validations/product.validation";

const router = Router();

/* ======================================================
   GET /api/products
====================================================== */
router.get("/", productController.getAllProducts);

/* ======================================================
   GET /api/products/:id
====================================================== */
router.get(
  "/:id",
  validate(getProductByIdSchema),
  productController.getProductById
);

/* ======================================================
   POST /api/products
====================================================== */
router.post(
  "/",
  validate(createProductSchema),
  productController.createProduct
);

/* ======================================================
   PUT /api/products/:id
====================================================== */
router.put(
  "/:id",
  validate(updateProductSchema),
  productController.updateProduct
);

/* ======================================================
   DELETE /api/products/:id
====================================================== */
router.delete(
  "/:id",
  validate(deleteProductSchema),
  productController.deleteProduct
);

export default router;
