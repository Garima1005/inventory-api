import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;

    if (!req.user) {
      return res.status(401).json({error: true, message: "Unauthorized" });
    }

    if (!(user?.role === "admin")) {
      return res.status(403).json({
        error: true,
        message: "You don't have access",
      });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({error: true, message: "Failed to validate role" });
  }
};

export const isVendor = ( req: AuthRequest,
  res: Response,
  next: NextFunction,) =>{
    try {
    const user = req.user;

    if (!req.user) {
      return res.status(401).json({error: true, message: "Unauthorized" });
    }

    if (!(user?.role === "vendor")) {
      return res.status(403).json({
        error: true,
        message: "You don't have access",
      });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({error: true, message: "Failed to validate role" });
  }
  }
