import { Request, Response } from "express";
import db from "../db/database";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createAuditLog } from "../utils/audit";

export const getCategory = async (req: Request, res: Response) => {
  try {
    const categories = db.prepare(`SELECT * FROM categories`).all();
    res.status(200).json({
        success: true,
      message: "Successfull !",
      categories: categories,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({error: true, message:"Failed to fetch categories"});
  }
};

export const addCategory = (req: AuthRequest, res: Response) => {
  try {
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({
        error:true,
        message: "Category name is required",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        error: true,
        message: "Category name must be at least 2 characters",
      });
    }

    const existing = db
      .prepare(`SELECT * FROM categories WHERE LOWER(name) = LOWER(?)`)
      .get(name);

    if (existing) {
      return res.status(409).json({
        error: true,
        message: "Category already exists",
      });
    }

    const result = db
      .prepare(`INSERT INTO categories (name) VALUES (?)`)
      .run(name);

    const currentUserId = req.user?.id

    if(!currentUserId){
        return res.status(400).json({
            error:true,
            message:"Failed to add category"
        });
    }

    createAuditLog({
      changedBy: currentUserId,
      action: "UPDATE",
      entity: "categories",
      entityId: Number(result.lastInsertRowid),
      fieldName: "category",
      oldValue: null,
      newValue: name,
    });

    return res.status(201).json({
      success: true,
      message: "Category added successfully",
      categoryId: result.lastInsertRowid,
    });

  } catch (err) {
    return res.status(500).json({
        error:true,
      message: "Failed to add category",
    });
  }
};

export const deleteCategory = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        error: true,
        message: "Valid category id is required",
      });
    }

    const category = db
      .prepare(`SELECT * FROM categories WHERE id = ?`)
      .get(id) as { id: number; name: string } | undefined;

    if (!category) {
      return res.status(404).json({
        error: true,
        message: "Category not found",
      });
    }

    db.prepare(`DELETE FROM categories WHERE id = ?`).run(id);

    createAuditLog({
      changedBy: (req as AuthRequest).user!.id,
      action: "DELETE",
      entity: "categories",
      entityId: category.id,
      fieldName: "name",
      oldValue: category.name,
      newValue: null,
    });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Failed to delete category",
    });
  }
};
