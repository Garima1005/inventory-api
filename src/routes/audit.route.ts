import express from "express";
import { getAuditLogs } from "../controllers/audit.controller";

const router = express.Router();

router.get("/", getAuditLogs);

export default router;