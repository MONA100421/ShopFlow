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

// Apply auth middleware to all cart routes
router.use(authMiddleware);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:productId", updateCartItem);
router.delete("/:productId", deleteCartItem);
router.delete("/", clearCart);
router.post("/merge", authMiddleware, mergeCart);

export default router;
