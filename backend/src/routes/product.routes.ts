import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { validate } from "../middlewares/validate";
import {
  getProductByIdSchema,
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
} from "../validations/product.validation";

const router = Router();

router.get("/", productController.getAllProducts);

router.get(
  "/:id",
  validate(getProductByIdSchema),
  productController.getProductById
);

router.post(
  "/",
  validate(createProductSchema),
  productController.createProduct
);

router.put(
  "/:id",
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  "/:id",
  validate(deleteProductSchema),
  productController.deleteProduct
);

export default router;
