import { Request, Response } from "express";

export async function login(req: Request, res: Response) {
  // ✅ 最小可用：假設任何人都登入成功
  const fakeUserId = "demo-user-123";

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
