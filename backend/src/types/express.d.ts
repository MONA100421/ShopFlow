import "express";
import "express-session";

// Session data extension
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Express request extension
declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
    }

    interface Request {
      user?: User;
    }
  }
}
