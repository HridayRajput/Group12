//  This route is for products
import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();


router.get("/", async (req: Request, res: Response) => {
  const [rows] = await pool.query("SELECT * FROM Products");
res.json(rows);
});

export default router;