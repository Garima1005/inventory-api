import db from "../db/database";
import { Request, Response } from "express";
import { User } from "../types/user.type";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createAuditLog } from "../utils/audit";
import bcrypt from 'bcrypt'

export const getUsers = (req: Request, res: Response) => {
  try {
    const users = db.prepare(`SELECT id, email, role FROM users`).all();

    return res.status(200).json({
      success: true,
      message: "user fetched successfully",
      users,
    });
  } catch (err) {
    return res.status(500).json({error:true, message: "Failed to fetch users" });
  }
};

export const updateUserRole = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["admin", "vendor", "customer"];

    if (!role) {
      return res.status(400).json({
        error:true,
        message: "Role is required",
      });
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: true,
        message: "invalid role",
      });
    }

    const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as User | undefined;

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    const oldRole = user.role;

    db.prepare(`UPDATE users SET role = ? WHERE id = ?`).run(role, id);

    const currentUserId = req.user?.id;

    if(!currentUserId){
        return res.status(400).json({
            error: true,
            message:"Failed to update role"
        })
    }
    
    createAuditLog({
      changedBy: currentUserId,
      action: "UPDATE",
      entity: "users",
      entityId: Number(id),
      fieldName: "role",
      oldValue: oldRole,
      newValue: role,
    });

    return res.status(200).json({
        sccess: true,
      message: "Role is updated successfully",
    });

  } catch (err) {
    return res.status(500).json({
        error: true,
      message: "Failed to update user role",
    });
  }
};

export const createVendor = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized",
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        error: true,
        message: "All fields are required",
      });
    }

    const existingUser = db
      .prepare(`SELECT id FROM users WHERE email = ?`)
      .get(email);

    if (existingUser) {
      return res.status(409).json({
        error: true,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db
      .prepare(
        `
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
      `,
      )
      .run(name, email, hashedPassword, "vendor");

    const userId = Number(result.lastInsertRowid);

    createAuditLog({
      changedBy: currentUser.id,
      action: "CREATE",
      entity: "users",
      entityId: userId,
      newValue: "vendor",
    });

    return res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      user: {
        id: userId,
        name,
        email,
        role: "vendor",
      },
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: true,
      message: "Failed to create vendor",
    });
  }
};

export const createAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized",
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        error: true,
        message: "All fields are required",
      });
    }

    const existingUser = db
      .prepare(`SELECT id FROM users WHERE email = ?`)
      .get(email);

    if (existingUser) {
      return res.status(409).json({
        error: true,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db
      .prepare(
        `
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
      `,
      )
      .run(name, email, hashedPassword, "admin");

    const userId = Number(result.lastInsertRowid);

    createAuditLog({
      changedBy: currentUser.id,
      action: "CREATE",
      entity: "users",
      entityId: userId,
      newValue: "admin",
    });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      user: {
        id: userId,
        name,
        email,
        role: "admin",
      },
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: true,
      message: "Failed to create admin",
    });
  }
};