import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CONFIG } from "../config.js";
import { UnauthorizedError, ForbiddenError } from "../lib/errors.js";

export interface JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    // Also try cookie
    const cookieToken = req.cookies?.accessToken;
    if (!cookieToken) throw new UnauthorizedError("No token provided");
    return verifyAndAttach(cookieToken, req, next);
  }

  verifyAndAttach(token, req, next);
}

function verifyAndAttach(token: string, req: Request, next: NextFunction) {
  try {
    const payload = jwt.verify(token, CONFIG.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError();
    if (!roles.includes(req.user.role)) throw new ForbiddenError("Insufficient permissions");
    next();
  };
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    const cookieToken = req.cookies?.accessToken;
    if (!cookieToken) return next();
    try {
      const payload = jwt.verify(cookieToken, CONFIG.JWT_SECRET) as JwtPayload;
      req.user = payload;
    } catch {
      // Ignore invalid token for optional auth
    }
    return next();
  }

  try {
    const payload = jwt.verify(token, CONFIG.JWT_SECRET) as JwtPayload;
    req.user = payload;
  } catch {
    // Ignore
  }
  next();
}
