import express from "express";
import cookieParser from "cookie-parser";
import authRoute from './routes/auth.route'
import userRoute from './routes/user.route'
import productRoute from './routes/product.route'
import categoryRoute from './routes/category.route'
import auditRoute from './routes/audit.route'
import { authMiddleware } from "./middlewares/auth.middleware";
import { isAdmin } from "./middlewares/role.middleware";


const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/health-check', (req, res)=>{
    res.status(200).json({
        success:  true,
        message: "Ok"
    })
})

app.use('/auth', authRoute);
app.use('/users', authMiddleware, isAdmin, userRoute);
app.use('/categories', authMiddleware, categoryRoute);
app.use('/products',authMiddleware, productRoute);

app.use(
  "/audit-logs",
  authMiddleware,
  isAdmin,
  auditRoute
);


export default app;