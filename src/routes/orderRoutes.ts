import { Router, Request, Response } from 'express';
import pool from "../db";

const router = Router();

const isValidId = (id: unknown): id is string => typeof id === "string" && /^\d+$/.test(id);

router.get('/', async (req: Request, res: Response) => {
    const [rows] = await pool.query("SELECT * FROM Orders");
    res.json(rows);
});

router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({ error: "Invalid order id" });
    }

    const [rows] = await pool.query("SELECT * FROM Orders WHERE id = ?", [id]);
    const orders = rows as any[];

    if (orders.length === 0) {
        return res.status(404).json({ error: "Order not found" });
    }

    res.json(orders[0]);
});

router.post('/', async (req: Request, res: Response) => {
    const { customerId, productId, quantity, totalPrice } = req.body;

    if (!customerId || !productId || !quantity || totalPrice === undefined) {
        return res.status(400).json({ error: "customerId, productId, quantity and totalPrice are required" });
    }

    try {
        const [result] = await pool.query(
            "INSERT INTO Orders (customerId, productId, quantity, totalPrice) VALUES (?, ?, ?, ?)",
            [customerId, productId, quantity, totalPrice]
        );
        res.status(201).json({ id: (result as any).insertId, customerId, productId, quantity, totalPrice });
    } catch (err: any) {
        if (err.errno === 1452) {
            return res.status(400).json({ error: "customerId or productId does not exist" });
        }
        throw err;
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { customerId, productId, quantity, totalPrice } = req.body;

    if (!isValidId(id)) {
        return res.status(400).json({ error: "Invalid order id" });
    }
    if (!customerId || !productId || !quantity || totalPrice === undefined) {
        return res.status(400).json({ error: "customerId, productId, quantity and totalPrice are required" });
    }

    try {
        const [result] = await pool.query(
            "UPDATE Orders SET customerId = ?, productId = ?, quantity = ?, totalPrice = ? WHERE id = ?",
            [customerId, productId, quantity, totalPrice, id]
        );

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json({ id: Number(id), customerId, productId, quantity, totalPrice });
    } catch (err: any) {
        if (err.errno === 1452) {
            return res.status(400).json({ error: "customerId or productId does not exist" });
        }
        throw err;
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({ error: "Invalid order id" });
    }

    const [result] = await pool.query("DELETE FROM Orders WHERE id = ?", [id]);

    if ((result as any).affectedRows === 0) {
        return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: `Order with id ${id} deleted` });
});

export default router;
