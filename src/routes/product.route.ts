import { Router } from "express";
import { addProduct, getProducts, getProductById, getLowStockProduct, updateProduct, deleteProduct } from "../controllers/product.controller";
import { isAdmin, isVendor } from "../middlewares/role.middleware";
import multer from "multer";

const route = Router();

const upload = multer({storage: multer.memoryStorage()});

route.get('/', getProducts);
route.get('/low-stock', getLowStockProduct);
route.get('/:id', getProductById);
route.post('/', upload.single("image"), addProduct);
route.patch('/:id', updateProduct);
route.delete('/:id', isAdmin, deleteProduct )

export default route;