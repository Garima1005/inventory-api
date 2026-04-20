import { Request } from "express";

export type Role = "admin" | "vendor" | "customer";

export interface User {
  id: number;
  email: string;
  password: string;
  role: Role;
}
