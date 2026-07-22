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

//PUT

router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address } = req.body;

    const [result] = await pool.query(
        "UPDATE Customers SET firstName = ?, lastName = ?, email = ?, phone = ?, address = ? WHERE customerId = ?",
        [firstName, lastName, email, phone, address, id]
    );

    if ((result as any).affectedRows === 0) {
        return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ id, firstName, lastName, email, phone, address });
});

//DELETE

router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM Customers WHERE customerId = ?", [id]);

    if ((result as any).affectedRows === 0) {
        return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ message: "Customer deleted successfully" });
});

//Test: Invoke-WebRequest -Method POST -Uri http://localhost:3001/customers -ContentType "application/json" -Body '{"firstName":"John","lastName":"Doe","email":"john.doe@example.com","phone":"123-456-7890","address":"123 Main St"}'
//Test: Invoke-WebRequest -Method PUT -Uri http://localhost:3001/customers/1 -ContentType "application/json" -Body '{"firstName":"Jane","lastName":"Doe","email":"jane.doe@example.com","phone":"098-765-4321","address":"456 Oak Ave"}'
//Test: Invoke-WebRequest -Method DELETE -Uri http://localhost:3001/customers/1
export default router;
