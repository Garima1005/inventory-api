import { Router } from "express";
import {getCategory, addCategory, deleteCategory} from "../controllers/category.controller"
import { isAdmin } from "../middlewares/role.middleware";

const route = Router();

route.get('', getCategory);
route.post('', isAdmin, addCategory);
route.delete('/:id', isAdmin, deleteCategory);

export default route;