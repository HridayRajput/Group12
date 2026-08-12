USE group12_app;

INSERT INTO Products (name, category, brand, description, price, stockQuantity) VALUES
('Wireless Mouse', 'Accessories', 'Logitech', 'Ergonomic wireless mouse with USB receiver', 24.99, 120),
('Mechanical Keyboard', 'Accessories', 'Corsair', 'RGB backlit mechanical keyboard, blue switches', 89.99, 60),
('27-inch 4K Monitor', 'Monitors', 'Samsung', 'UHD IPS monitor with HDR support', 329.99, 25),
('Noise Cancelling Headphones', 'Audio', 'Sony', 'Over-ear wireless headphones with ANC', 199.99, 40),
('Portable SSD 1TB', 'Storage', 'SanDisk', 'USB-C portable solid state drive', 109.99, 75),
('Smartphone 128GB', 'Mobile', 'Samsung', 'Mid-range Android smartphone, 128GB storage', 449.99, 30),
('Laptop Stand', 'Accessories', 'AmazonBasics', 'Adjustable aluminum laptop stand', 19.99, 150),
('Webcam 1080p', 'Accessories', 'Logitech', 'HD webcam with built-in microphone', 39.99, 90);

INSERT INTO Customers (firstName, lastName, email, phone, address) VALUES
('Hriday', 'Rajput', 'hriday.rajput@example.com', '416-555-0101', '12 Maple Street, Toronto, ON'),
('Raman', 'Kumari', 'raman.kumari@example.com', '416-555-0102', '45 Oak Avenue, Toronto, ON'),
('Vivek', 'Chaudhary', 'vivek.chaudhary@example.com', '416-555-0103', '78 Pine Road, Mississauga, ON'),
('Priya', 'Sharma', 'priya.sharma@example.com', '647-555-0104', '9 Birch Lane, Brampton, ON'),
('John', 'Doe', 'john.doe@example.com', '905-555-0105', '123 Main St, Hamilton, ON'),
('User', 'Panel', 'user@example.com', '555-555-0106', '1 Member Way, Ottawa, ON');

-- Passwords: admins -> Admin@123, member -> User@123 (see README).
INSERT INTO Users (fullName, username, email, passwordHash, role, customerId) VALUES
('Hriday Rajput', 'hridayrajput', 'hriday.rajput@example.com', '$2b$10$f72O5KEV20v0QmAtFu/ZfOB5Goiv6LayDVtnh3QYuOinU8t4dBtOq', 'admin', 1),
('Raman Kumari', 'ramankumaree202-collab', 'raman.kumari@example.com', '$2b$10$f72O5KEV20v0QmAtFu/ZfOB5Goiv6LayDVtnh3QYuOinU8t4dBtOq', 'admin', 2),
('Vivek Chaudhary', 'VivekChaudhary880', 'vivek.chaudhary@example.com', '$2b$10$f72O5KEV20v0QmAtFu/ZfOB5Goiv6LayDVtnh3QYuOinU8t4dBtOq', 'admin', 3),
('User Panel', 'userpanel', 'user@example.com', '$2b$10$o4Qdh3GYE.UPRhAvcBs1J.NyowypnpG0cdNpSrCgb00Yn6idY/aDO', 'member', 6);

INSERT INTO Orders (customerId, productId, quantity, totalPrice) VALUES
(1, 1, 2, 49.98),
(1, 4, 1, 199.99),
(2, 3, 1, 329.99),
(3, 2, 1, 89.99),
(4, 6, 1, 449.99),
(5, 7, 3, 59.97),
(2, 8, 2, 79.98);
