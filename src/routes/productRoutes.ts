import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

const isValidId = (id: unknown): id is string => typeof id === "string" && /^\d+$/.test(id);

router.get("/", async (req: Request, res: Response) => {
  const [rows] = await pool.query("SELECT * FROM Products");
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const [rows] = await pool.query("SELECT * FROM Products WHERE productId = ?", [id]);
  const products = rows as any[];

  if (products.length === 0) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(products[0]);
});

router.post("/", async (req: Request, res: Response) => {
  const { name, category, brand, description, price, stockQuantity } = req.body;

  if (!name || price === undefined || stockQuantity === undefined) {
    return res.status(400).json({ error: "name, price and stockQuantity are required" });
  }

  const [result] = await pool.query(
    "INSERT INTO Products (name, category, brand, description, price, stockQuantity) VALUES (?, ?, ?, ?, ?, ?)",
    [name, category ?? null, brand ?? null, description ?? null, price, stockQuantity]
  );

  res.status(201).json({
    message: "Product created successfully",
    productId: (result as any).insertId,
    name,
    category,
    brand,
    description,
    price,
    stockQuantity
  });
});

router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, category, brand, description, price, stockQuantity } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }
  if (!name || price === undefined || stockQuantity === undefined) {
    return res.status(400).json({ error: "name, price and stockQuantity are required" });
  }

  const [result] = await pool.query(
    "UPDATE Products SET name = ?, category = ?, brand = ?, description = ?, price = ?, stockQuantity = ? WHERE productId = ?",
    [name, category ?? null, brand ?? null, description ?? null, price, stockQuantity, id]
  );

  if ((result as any).affectedRows === 0) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json({ productId: Number(id), name, category, brand, description, price, stockQuantity });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const [result] = await pool.query("DELETE FROM Products WHERE productId = ?", [id]);

  if ((result as any).affectedRows === 0) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json({ message: "Product deleted successfully" });
});

export default router;
