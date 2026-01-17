import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
  mergeCart
} from "../controllers/cart.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * ⚠️ 關鍵：所有 cart API 都必須先過 auth
 */
router.use(authMiddleware);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:productId", updateCartItem);
router.delete("/:productId", deleteCartItem);
router.delete("/", clearCart);
router.post("/merge", authMiddleware, mergeCart);

export default router;
