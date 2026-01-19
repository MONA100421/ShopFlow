import { Router, Request, Response } from "express";
import cartRouter from "./cart.routes";

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: "created" | "paid" | "shipped" | "completed";
  createdAt: string;
}

interface CartRouterWithHelpers {
  __getCartItems?: () => {
    product: {
      id: string;
      title: string;
      price: number;
    };
    quantity: number;
  }[];
  __clearCart?: () => void;
}

// Create router
const router = Router();

// In-memory orders storage (for demo purposes)
const orders: Order[] = [];


router.post("/", (_req: Request, res: Response) => {
  const cartHelpers =
    cartRouter as unknown as CartRouterWithHelpers;

  const cartItems = cartHelpers.__getCartItems?.() ?? [];

  if (!cartItems.length) {
    return res.status(400).json({
      error: "Cart is empty",
    });
  }

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + item.product.price * item.quantity,
    0
  );

  const tax = Number((subtotal * 0.1).toFixed(2));
  const discount = 0;
  const total = Number(
    (subtotal + tax - discount).toFixed(2)
  );

  const order: Order = {
    id: `ORD-${Date.now()}`,
    items: cartItems.map((item) => ({
      productId: item.product.id,
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
    })),
    subtotal,
    tax,
    discount,
    total,
    status: "created",
    createdAt: new Date().toISOString(),
  };

  orders.push(order);

  cartHelpers.__clearCart?.();

  res.status(201).json(order);
});

// GET /api/orders
router.get("/", (_req: Request, res: Response) => {
  res.json(orders);
});

// GET /api/orders/:orderId
router.get(
  "/:orderId",
  (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = orders.find(
      (o) => o.id === orderId
    );

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    res.json(order);
  }
);

export default router;
