import { Router } from "express";
import { getUsers, updateUserRole, createAdmin, createVendor } from "../controllers/users.controller";
import { isAdmin } from "../middlewares/role.middleware";

const route = Router();

route.get("/",getUsers);
route.patch("/:id/role", updateUserRole);

route.post("/create-vendor", isAdmin, createVendor);
route.post("/create-admin",isAdmin, createAdmin);


export default route;