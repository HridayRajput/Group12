Group project for OS web Group members - Vivek Chaudhary, Hriday Rajput, Raman Kumari

SETUP: 
- use schema.sql in MYsql workbench to run user root
- optionally run seed.sql after schema.sql to load sample products/customers/orders for testing
- copy .env.example to .env and fill in your local MySQL credentials
- run "npm install"
- open bash and enter "npm run dev" to run the server (http://localhost:3001)
- open powershell and run test customer post/get

Project description: This project is an Electronics shopping website. It will have a selection of products along with their descriptions, prices and checkout. It tracks orders, list of products in the store and customer information.

Technology -Using MySQL because it is flexible and connects to a pool db for each route

## Milestone 4 – API Endpoints

All routes are prefixed by their resource path (no `/api` prefix). Every write endpoint uses parameterized queries and returns JSON with the appropriate HTTP status code (200/201/400/404/500).

### Products (`/products`)
| Method | Path | Description |
|---|---|---|
| GET | /products | List all products |
| GET | /products/:id | Get a single product |
| POST | /products | Create a product |
| PUT | /products/:id | Update a product |
| DELETE | /products/:id | Delete a product |

### Customers (`/customers`)
| Method | Path | Description |
|---|---|---|
| GET | /customers | List all customers |
| GET | /customers/:id | Get a single customer |
| POST | /customers | Create a customer |
| PUT | /customers/:id | Update a customer |
| DELETE | /customers/:id | Delete a customer |

### Orders (`/orders`)
| Method | Path | Description |
|---|---|---|
| GET | /orders | List all orders |
| GET | /orders/:id | Get a single order |
| POST | /orders | Create an order |
| PUT | /orders/:id | Update an order |
| DELETE | /orders/:id | Delete an order |

### Testing the API

Sample `Invoke-WebRequest` commands (PowerShell) for each resource:

```powershell
# Customers
Invoke-WebRequest -Uri http://localhost:3001/customers -Method GET
Invoke-WebRequest -Uri http://localhost:3001/customers/1 -Method GET
Invoke-WebRequest -Method POST -Uri http://localhost:3001/customers -ContentType "application/json" -Body '{"firstName":"John","lastName":"Doe","email":"john.doe@example.com","phone":"123-456-7890","address":"123 Main St"}'
Invoke-WebRequest -Method PUT -Uri http://localhost:3001/customers/1 -ContentType "application/json" -Body '{"firstName":"Jane","lastName":"Doe","email":"jane.doe@example.com","phone":"098-765-4321","address":"456 Oak Ave"}'
Invoke-WebRequest -Method DELETE -Uri http://localhost:3001/customers/1

# Orders
Invoke-WebRequest -Uri http://localhost:3001/orders -Method GET
Invoke-WebRequest -Uri http://localhost:3001/orders/1 -Method GET
Invoke-WebRequest -Uri http://localhost:3001/orders -Method POST -Body '{"customerId":1,"productId":2,"quantity":3,"totalPrice":29.99}' -ContentType "application/json"
Invoke-WebRequest -Uri http://localhost:3001/orders/1 -Method PUT -Body '{"customerId":1,"productId":2,"quantity":5,"totalPrice":49.99}' -ContentType "application/json"
Invoke-WebRequest -Uri http://localhost:3001/orders/1 -Method DELETE

# Products
Invoke-WebRequest -Uri http://localhost:3001/products -Method GET
Invoke-WebRequest -Uri http://localhost:3001/products/1 -Method GET
Invoke-WebRequest -Method POST -Uri http://localhost:3001/products -ContentType "application/json" -Body '{"name":"Sample Product","category":"Electronics","brand":"BrandX","description":"A sample product description","price":99.99,"stockQuantity":50}'
Invoke-WebRequest -Method PUT -Uri http://localhost:3001/products/1 -ContentType "application/json" -Body '{"name":"Updated Product","category":"Electronics","brand":"BrandX","description":"An updated product description","price":89.99,"stockQuantity":30}'
Invoke-WebRequest -Method DELETE -Uri http://localhost:3001/products/1
```

Team Responsibilities

Student 1 – Database Designer - Hriday Selected MySQL database
Designed Products, Customers, and Orders collections
Prepared database documentation

Student 2 – Backend Planner -Raman Planned Express and TypeScript backend structure
Designed API routes for Products, Customers, and Orders
Created technical documentation

Student 3 – Frontend Designer – Vivek Created wireframes for all pages
Designed user interface layouts
Planned website navigation and user experience
