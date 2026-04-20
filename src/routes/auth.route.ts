import { Router } from "express";
import { userRegister, userLogin, userLogout } from "../controllers/auth.controller";

const route = Router();

route.post('/register', userRegister);
route.post('/login', userLogin);
route.get('/logout', userLogout);

export default route;