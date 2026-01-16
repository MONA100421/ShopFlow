import { Router } from "express";
import * as cartController from "../controllers/cart.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/:productId", cartController.updateCartItem);
router.delete("/:productId", cartController.deleteCartItem);
router.delete("/", cartController.clearCart);

export default router;
