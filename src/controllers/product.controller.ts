import { Request, Response } from "express";
import db from "../db/database";
import { AuthRequest } from "../middlewares/auth.middleware";
import { uploadFile } from "../services/storage.services";
import { createAuditLog } from "../utils/audit";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = db
      .prepare(
        `SELECT p.id,
        p.name,
        p.price,
        p.stock,
        p.image,
        p.created_by,
        p.category_id,
        c.name AS category_name,
        u.name AS created_by_name
        
        FROM products AS p LEFT JOIN categories AS c ON p.category_id = c.id
        LEFT JOIN users AS u ON p.created_by = u.id `,
      )
      .all();

    if (!products) {
      return res.status(404).json({
        error: true,
        message: "No product found",
      });
    }

    return res.status(200).json({
      success: true,
      products: products,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: true,
      message: "Failed to fetch the products",
    });
  }
};

export const getLowStockProduct = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 5;

    const products = db
      .prepare(
        `SELECT p.id,
        p.name,
        p.price,
        p.stock,
        p.image,
        p.created_by,
        p.category_id,
        c.name AS category_name,
        u.name AS created_by_name

        FROM products AS p LEFT JOIN categories AS c ON p.category_id = c.id
        LEFT JOIN users AS u ON p.created_by = u.id
        WHERE p.stock <= ?`,
      )
      .all(limit);

    return res.status(200).json({
      success: true,
      products: products,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: true,
      message: "Failed the fetch product",
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: true,
        message: "Id is required",
      });
    }

    if (isNaN(Number(id))) {
      return res.status(400).json({
        error: true,
        message: "Invalid product id",
      });
    }

    const products = db
      .prepare(
        `SELECT p.id,
        p.name,
        p.price,
        p.stock,
        p.image,
        p.created_by,
        p.category_id,
        c.name AS category_name,
        u.name AS created_by_name
        
        FROM products AS p LEFT JOIN categories AS c ON p.category_id = c.id
        LEFT JOIN users AS u ON p.created_by = u.id 
        WHERE p.id = ?`,
      )
      .get(id);

    if (!products) {
      return res.status(404).json({
        error: true,
        message: "No product found",
      });
    }

    return res.status(200).json({
      success: true,
      products: products,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: true,
      message: "Failed the fetch product",
    });
  }
};

export const addProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, stock, category_id } = req.body;

    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized",
      });
    }

    if (currentUser.role !== "admin" && currentUser.role !== "vendor") {
      return res.status(403).json({
        error: true,
        message: "Access denied",
      });
    }

    if (!name || !price || !category_id) {
      return res.status(400).json({
        error: true,
        message: "name, price, category_id are required",
      });
    }

    const category = db
      .prepare(`SELECT * FROM categories WHERE id = ?`)
      .get(category_id);

    if (!category) {
      return res.status(404).json({
        error: true,
        message: "Category not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: "Image is required",
      });
    }

    const imageUrl = await uploadFile(req.file?.buffer, req.file?.originalname);

    const result = db
      .prepare(
        `
        INSERT INTO products
        (name, price, stock, category_id, image, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      )
      .run(
        name,
        Number(price),
        Number(stock || 0),
        Number(category_id),
        imageUrl.url,
        currentUser.id,
      );

    const productId = Number(result.lastInsertRowid);

      let product = db
      .prepare(
        `
        SELECT
        * FROM products
        WHERE id = ?
      `,
      ).get(productId);

      console.log(product);
      if(!product) product = null;
      

    createAuditLog({
      changedBy: currentUser.id,
      action: "CREATE",
      entity: "products",
      entityId: productId,
      fieldName: "product",
      oldValue: null,
      newValue: JSON.stringify(product),
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      productId,
      image: imageUrl.url,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: true,
      message: "Failed to add product",
    });
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, price, stock, category_id } = req.body;

    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized",
      });
    }

    if (
      currentUser.role !== "admin" &&
      currentUser.role !== "vendor"
    ) {
      return res.status(403).json({
        error: true,
        message: "Access denied",
      });
    }

    const product = db
      .prepare(`SELECT * FROM products WHERE id = ?`)
      .get(id) as any;

    if (!product) {
      return res.status(404).json({
        error: true,
        message: "Product not found",
      });
    }

    let imageUrl = product.image;

    if (req.file) {
      const uploadResult = await uploadFile(
        req.file.buffer,
        `${Date.now()}-${req.file.originalname}`
      );

      imageUrl = uploadResult.url ?? product.image;
    }

    const updatedName = name ?? product.name;
    const updatedPrice = price ?? product.price;
    const updatedStock = stock ?? product.stock;
    const updatedCategory =
      category_id ?? product.category_id;

    db.prepare(
      `
      UPDATE products
      SET name = ?, price = ?, stock = ?, category_id = ?, image = ?
      WHERE id = ?
    `
    ).run(
      updatedName,
      Number(updatedPrice),
      Number(updatedStock),
      Number(updatedCategory),
      imageUrl,
      id
    );

    createAuditLog({
      changedBy: currentUser.id,
      action: "UPDATE",
      entity: "products",
      entityId: Number(id),
      fieldName: "product",
      oldValue: JSON.stringify(product),
      newValue: JSON.stringify({
        name: updatedName,
        price: updatedPrice,
        stock: updatedStock,
        category_id: updatedCategory,
        image: imageUrl,
      }),
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: true,
      message: "Failed to update product",
    });
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized",
      });
    }

    if (currentUser.role !== "admin") {
      return res.status(403).json({
        error: true,
        message: "Only admin can delete product",
      });
    }

    const product = db
      .prepare(`SELECT * FROM products WHERE id = ?`)
      .get(id) as any;

    if (!product) {
      return res.status(404).json({
        error: true,
        message: "Product not found",
      });
    }

    db.prepare(`DELETE FROM products WHERE id = ?`).run(id);

    createAuditLog({
      changedBy: currentUser.id,
      action: "DELETE",
      entity: "products",
      entityId: Number(id),
      fieldName: "product",
      oldValue: JSON.stringify(product),
      newValue: undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: true,
      message: "Failed to delete product",
    });
  }
};