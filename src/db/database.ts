import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const dbPath = process.env.DB_PATH;

const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

export default db as Database.Database;