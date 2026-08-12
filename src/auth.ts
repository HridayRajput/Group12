import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "group12_auth";

export interface AuthenticatedUser extends JwtPayload {
  userId: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  customerId: number | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return secret;
};

export const signAuthToken = (user: AuthenticatedUser): string => {
  return jwt.sign(user, getJwtSecret(), { expiresIn: "8h" });
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : undefined;
  const token = req.cookies?.[AUTH_COOKIE_NAME] ?? bearerToken;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    req.user = jwt.verify(token, getJwtSecret()) as AuthenticatedUser;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  return next();
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
};