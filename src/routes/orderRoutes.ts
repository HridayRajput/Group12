//This route is for orders
import { Router, Request, Response } from 'express';
import pool from "../db";
/*CREATE TABLE Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL,
    totalPrice DECIMAL(10,2) NOT NULL,
    orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_customer
        FOREIGN KEY (customerId)
        REFERENCES Customers(customerId),

    CONSTRAINT fk_order_product
        FOREIGN KEY (productId)
        REFERENCES Products(productId)
);*/

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const [rows] = await pool.query("SELECT * FROM Orders");
    res.json(rows);
});
router.post('/', async (req: Request, res: Response) => {
    const { customerId, productId, quantity, totalPrice } = req.body;
    const [result] = await pool.query("INSERT INTO Orders (customerId, productId, quantity, totalPrice) VALUES (?, ?, ?, ?)", [customerId, productId, quantity, totalPrice]);
    res.json({ id: (result as any).insertId, customerId, productId, quantity, totalPrice });
});
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { customerId, productId, quantity, totalPrice } = req.body;
    const [result] = await pool.query("UPDATE Orders SET customerId = ?, productId = ?, quantity = ?, totalPrice = ? WHERE id = ?", [customerId, productId, quantity, totalPrice, id]);
    res.json({ id: parseInt(id), customerId, productId, quantity, totalPrice });
});
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    await pool.query("DELETE FROM Orders WHERE id = ?", [id]);
    res.json({ message: `Order with id ${id} deleted` });
});

//Test: Invoke-WebRequest -Uri http://localhost:3001/orders -Method GET
//Test: Invoke-WebRequest -Uri http://localhost:3001/orders -Method POST -Body '{"customerId":1,"productId":2,"quantity":3,"totalPrice":29.99}' -ContentType "application/json"
//Test: Invoke-WebRequest -Uri http://localhost:3001/orders/1 -Method PUT -Body '{"customerId":1,"productId":2,"quantity":5,"totalPrice":49.99}' -ContentType "application/json"
//Test: Invoke-WebRequest -Uri http://localhost:3001/orders/1 -Method DELETE
export default router;
