// src/routes/cart.routes.ts
import { Router } from "express";
import * as cartController from "../controllers/cart.controller";

const router = Router();

/* ================= Cart Routes ================= */

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/:productId", cartController.updateCartItem);
router.delete("/:productId", cartController.deleteCartItem);
router.delete("/", cartController.clearCart);

export default router;
