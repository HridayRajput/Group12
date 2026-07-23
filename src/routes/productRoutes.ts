//  This route is for products
import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

// Get // 

router.get("/", async (req: Request, res: Response) => {
  const [rows] = await pool.query("SELECT * FROM Products");
  res.json(rows);
});

// Post //

router.post("/", async (req: Request, res: Response) => {
  const { name, category, brand, description, price, stockQuantity } = req.body;

  const [result] = await pool.query(
    "INSERT INTO Products (name, category, brand, description, price, stockQuantity) VALUES (?, ?, ?, ?, ?, ?)",
    [name, category, brand, description, price, stockQuantity]
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

// Put //
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, category, brand, description, price, stockQuantity } = req.body;

  const [result] = await pool.query(
    "UPDATE Products SET name = ?, category = ?, brand = ?, description = ?, price = ?, stockQuantity = ? WHERE productId = ?",
    [name, category, brand, description, price, stockQuantity, id]
  );

  if ((result as any).affectedRows === 0) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json({ id, name, category, brand, description, price, stockQuantity });
});


// Delete //

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const [result] = await pool.query("DELETE FROM Products WHERE productId = ?", [id]);

  if ((result as any).affectedRows === 0) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json({ message: "Product deleted successfully" });
});

//Test: Invoke-WebRequest -Method POST -Uri http://localhost:3001/products -ContentType "application/json" -Body '{"name":"Sample Product","category":"Electronics","brand":"BrandX","description":"A sample product description","price":99.99,"stockQuantity":50}'  
//Test: Invoke-WebRequest -Method PUT -Uri http://localhost:3001/products/1 -ContentType "application/json" -Body '{"name":"Updated Product","category":"Electronics","brand":"BrandX","description":"An updated product description","price":89.99,"stockQuantity":30}'  
//Test: Invoke-WebRequest -Method DELETE -Uri http://localhost:3001/products/1
export default router;
