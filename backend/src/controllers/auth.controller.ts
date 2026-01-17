// backend/src/controllers/auth.controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";

export async function login(req: Request, res: Response) {
  // ✅ 用合法的 MongoDB ObjectId
  const fakeUserId = new mongoose.Types.ObjectId().toString();

  req.session.userId = fakeUserId;

  res.json({
    ok: true,
    userId: fakeUserId,
  });
}

export function logout(req: Request, res: Response) {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
}

export function me(req: Request, res: Response) {
  if (!req.session.userId) {
    return res.json(null);
  }

  res.json({
    id: req.session.userId,
  });
}
