import "express";
import "express-session";

/* ================= Session ================= */

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

/* ================= Express ================= */

declare global {
  namespace Express {
    interface User {
      id: string;
      // ✅ demo auth：先不強制 email / role
      email?: string;
    }

    interface Request {
      user?: User;
    }
  }
}
