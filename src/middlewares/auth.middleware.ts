import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized",
      });
    }

    const decode = verifyToken(token) as {
      id: number;
      role: string;
    };

    req.user = decode;

    next();
  } catch (err) {
    return res.status(401).json({error: true, message: "Authentication failed" });
  }
};
