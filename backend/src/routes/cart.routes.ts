import { Router } from "express";
import * as cartController from "../controllers/cart.controller";
import { auth } from "../middlewares/auth.middleware";

const router = Router();

/* ================= Cart Routes (User-based) ================= */

router.use(auth);

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/:productId", cartController.updateCartItem);
router.delete("/:productId", cartController.deleteCartItem);
router.delete("/", cartController.clearCart);

export default router;
