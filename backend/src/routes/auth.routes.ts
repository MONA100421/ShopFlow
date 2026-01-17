// backend/src/routes/auth.routes.ts
import { Router } from "express";
import {
  login,
  register,
  logout,
  me,
} from "../controllers/auth.controller";

const router = Router();

/**
 * Auth routes
 */
router.post("/register", register); // ✅ 新增這行
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", me);

export default router;
