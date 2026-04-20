import db from "../db/database";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcrypt";
import { Request, Response } from "express";

export const userRegister = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    const role = "customer";

    if (!name || !email || !password) {
      return res.status(400).json({
        error: true,
        message: "Name, email and password are required",
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
      .run(name, email, hashedPassword, role);

    const userId = Number(result.lastInsertRowid);

    const token = generateToken({
      id: userId,
      role,
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: userId,
        name,
        email,
        role,
      },
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: true,
      message: "Registration failed",
    });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "Email and password are required",
      });
    }

    const existingUser = db
      .prepare(`SELECT * FROM users WHERE email = ?`)
      .get(email) as any;

    if (!existingUser) {
      return res.status(404).json({
        error: true,
        message: "User does not exist",
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    const token = generateToken({
      id: Number(existingUser.id),
      role: existingUser.role,
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: Number(existingUser.id),
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: true,
      message: "Login failed",
    });
  }
};

export const userLogout = (req: Request, res: Response) => {
  res.clearCookie("token");

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};