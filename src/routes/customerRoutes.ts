//  This route is for customers
import { Router, Request, Response } from 'express';
import pool from "../db";
/*CREATE TABLE Customers (
    customerId INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255)
);*/
const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const [rows] = await pool.query("SELECT * FROM Customers");
    res.json(rows);
});

router.post('/', async (req: Request, res: Response) => {
    const { firstName, lastName, email, phone, address } = req.body;
    const [result] = await pool.query(
        "INSERT INTO Customers (firstName, lastName, email, phone, address) VALUES (?, ?, ?, ?, ?)",
        [firstName, lastName, email, phone, address]
    );
    res.status(201).json({ id: (result as any).insertId, firstName, lastName, email, phone, address });
});

export default router;