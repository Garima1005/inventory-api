import db from "./database";
import bcrypt from "bcrypt";

export const seedDatabase = async () => {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_PASSWORD is not defined in .env");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // USERS
  db.prepare(
    `
      INSERT OR IGNORE INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `,
  ).run("Admin User", "admin@mail.com", hashedPassword, "admin");

  db.prepare(
    `
      INSERT OR IGNORE INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `,
  ).run("Vendor User", "vendor@mail.com", hashedPassword, "vendor");

  db.prepare(
    `
      INSERT OR IGNORE INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `,
  ).run("Customer User", "customer@mail.com", hashedPassword, "customer");

  // CATEGORY
  db.prepare(
    `
      INSERT OR IGNORE INTO categories (name)
      VALUES (?)
    `,
  ).run("Electronics");

  db.prepare(
    `
      INSERT OR IGNORE INTO categories (name)
      VALUES (?)
    `,
  ).run("Fashion");

  db.prepare(
    `
      INSERT OR IGNORE INTO categories (name)
      VALUES (?)
    `,
  ).run("Groceries");

  // PRODUCTS
  db.prepare(`DELETE FROM products`).run();

  db.prepare(
    `
      INSERT INTO products
      (name, price, stock, category_id, image, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
  ).run("iPhone 15", 999, 5, 1, "uploads/iphone15.jpg", 1);

  db.prepare(
    `
      INSERT INTO products
      (name, price, stock, category_id, image, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
  ).run("T-Shirt", 25, 40, 2, "uploads/tshirt.jpg", 2);

  db.prepare(
    `
      INSERT INTO products
      (name, price, stock, category_id, image, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
  ).run("Rice Bag", 10, 2, 3, "uploads/ricebag.jpg", 2);

  db.prepare(
    `
      INSERT INTO products
      (name, price, stock, category_id, image, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
  ).run("Laptop", 1200, 1, 1, "uploads/laptop.jpg", 1);

  console.log("Seeds are created");
};
