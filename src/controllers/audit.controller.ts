import { Request, Response } from "express";
import db from "../db/database";

export const getAuditLogs = (req: Request, res: Response) => {
  try {
    const logs = db
      .prepare(
        `
      SELECT *
      FROM audit_logs
      ORDER BY timestamp DESC
    `,
      )
      .all();

    return res.status(200).json({
      success: true,
      logs,
    });
  } catch {
    return res.status(500).json({
        error:true,
      message: "Failed to fetch logs",
    });
  }
};
