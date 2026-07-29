import { Router, Request, Response } from 'express';
import pool from "../db";

const router = Router();

const isValidId = (id: unknown): id is string => typeof id === "string" && /^\d+$/.test(id);

router.get('/', async (req: Request, res: Response) => {
    const [rows] = await pool.query("SELECT * FROM Customers");
    res.json(rows);
});

router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({ error: "Invalid customer id" });
    }

    const [rows] = await pool.query("SELECT * FROM Customers WHERE customerId = ?", [id]);
    const customers = rows as any[];

    if (customers.length === 0) {
        return res.status(404).json({ error: "Customer not found" });
    }

    res.json(customers[0]);
});

router.post('/', async (req: Request, res: Response) => {
    const { firstName, lastName, email, phone, address } = req.body;

    if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: "firstName, lastName and email are required" });
    }

    try {
        const [result] = await pool.query(
            "INSERT INTO Customers (firstName, lastName, email, phone, address) VALUES (?, ?, ?, ?, ?)",
            [firstName, lastName, email, phone ?? null, address ?? null]
        );
        res.status(201).json({ customerId: (result as any).insertId, firstName, lastName, email, phone, address });
    } catch (err: any) {
        if (err.errno === 1062) {
            return res.status(400).json({ error: "A customer with this email already exists" });
        }
        throw err;
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address } = req.body;

    if (!isValidId(id)) {
        return res.status(400).json({ error: "Invalid customer id" });
    }
    if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: "firstName, lastName and email are required" });
    }

    try {
        const [result] = await pool.query(
            "UPDATE Customers SET firstName = ?, lastName = ?, email = ?, phone = ?, address = ? WHERE customerId = ?",
            [firstName, lastName, email, phone ?? null, address ?? null, id]
        );

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: "Customer not found" });
        }

        res.json({ customerId: Number(id), firstName, lastName, email, phone, address });
    } catch (err: any) {
        if (err.errno === 1062) {
            return res.status(400).json({ error: "A customer with this email already exists" });
        }
        throw err;
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({ error: "Invalid customer id" });
    }

    const [result] = await pool.query("DELETE FROM Customers WHERE customerId = ?", [id]);

    if ((result as any).affectedRows === 0) {
        return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ message: "Customer deleted successfully" });
});

export default router;
