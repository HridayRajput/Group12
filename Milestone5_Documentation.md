# Milestone 5 Documentation

## System Overview

This application is an electronics store management platform. Admins manage the full
product catalog, customer records, orders, and user accounts. Members browse the
catalog, save favorites, and place their own orders. Both roles use an AI helper to
generate product descriptions or get a budget-based product recommendation, without
leaving the page. The backend is Express + MySQL; the frontend is a React SPA styled
with Tailwind CSS.

## Backend Architecture

Tech stack:

- Express + TypeScript
- MySQL with `mysql2/promise`
- `bcryptjs` for password hashing
- JWT stored in an httpOnly cookie, verified by `authenticateToken` middleware
- `requireAdmin` middleware for role-gated routes
- `helmet`, `cors`, and login/register rate limiting for security

Database tables:

- `Products(productId, name, category, brand, description, price, stockQuantity)`
- `Customers(customerId, firstName, lastName, email, phone, address)`
- `Orders(id, customerId, productId, quantity, totalPrice, orderDate)`
- `Users(userId, fullName, username, email, passwordHash, role, customerId, createdAt)`
  — `customerId` links each account to its own `Customers` row, so members can only
  ever place orders as themselves.

API endpoints:

| Method | Path | Access | Request body | Response |
|---|---|---|---|---|
| POST | /auth/login | Public | `{ identifier, password }` | Sets auth cookie and returns the user |
| POST | /auth/register | Public | `{ fullName, username, email, password }` | Creates a member account + linked customer profile |
| GET | /auth/me | Authenticated | none | Current session user |
| POST | /auth/logout | Authenticated | none | Clears auth cookie |
| GET | /auth/users | Admin | none | List of all accounts |
| PATCH | /auth/users/:id/role | Admin | `{ role }` | Updated role |
| GET | /products | Authenticated | none | Product list |
| GET | /products/:id | Authenticated | none | One product |
| POST | /products | Admin | product fields | Created product |
| PUT | /products/:id | Admin | product fields | Updated product |
| DELETE | /products/:id | Admin | none | Delete confirmation |
| GET | /customers/lookup | Authenticated | none | Id/name pairs only (order form) |
| GET | /customers | Admin | none | Full customer list |
| GET | /customers/:id | Admin | none | One customer |
| POST | /customers | Admin | customer fields | Created customer |
| PUT | /customers/:id | Admin | customer fields | Updated customer |
| DELETE | /customers/:id | Admin | none | Delete confirmation |
| GET | /orders | Authenticated | none | Order list |
| GET | /orders/:id | Authenticated | none | One order |
| POST | /orders | Authenticated | order fields | Created order (customerId forced to the caller's own for members) |
| PUT | /orders/:id | Admin | order fields | Updated order |
| DELETE | /orders/:id | Admin | none | Delete confirmation |
| POST | /ai/product-description | Authenticated | `{ productName, category, brand, features }` | Generated description |
| POST | /ai/recommend | Authenticated | `{ budget, category }` | Recommended in-stock product + blurb |

## Frontend Architecture

Component tree:

- `main.tsx` mounts the React app inside `BrowserRouter`
- `App.tsx` handles session loading and route guards (login/register/app)
- `LoginPage.tsx` / `RegisterPage.tsx` — auth forms
- `Dashboard.tsx` — role-aware SPA shell: nav, hero, admin-only widgets (recent
  orders, low-stock alerts, inventory value), routes to the section panels below
- `ProductsPanel.tsx` — admin manage table or member read-only catalog cards
- `CustomersPanel.tsx` — admin-only customer CRUD
- `OrdersPanel.tsx` — admin full CRUD table, or member place-order form + session receipts
- `UsersPanel.tsx` — admin-only user list with role promote/revoke
- `FavoritesPanel.tsx` — member-only saved products (backed by `hooks/useFavorites.ts`)
- `AiAssistant.tsx` — description generator + product recommender
- `api.ts` / `types.ts` — typed fetch client and shared interfaces

## Authentication Flow

1. The user opens the frontend and is redirected to the login page if no valid session exists.
2. The user submits a username/email and password, or registers a new account.
3. On login, the backend looks up the user and compares the password with `bcryptjs`. On
   register, a new `Customers` row is created and linked via `customerId`.
4. If valid, the backend signs a JWT (including `role` and `customerId`) and stores it
   in an httpOnly cookie.
5. The frontend calls `/auth/me` to hydrate the session and unlock the dashboard.
6. Every protected request includes the cookie automatically; `authenticateToken`
   verifies it, and `requireAdmin` additionally checks `role` on admin-only routes.
7. Logging out clears the cookie and returns the user to the login screen.

## Wireframes

The wireframe images are stored in `Images/`:

- [Homepage](Images/Homepage.png)
- [Routes](Images/Routes.png)
- [New Product](Images/Newproduct.png)
- [Edit Product](Images/Editproduct.png)
- [Data Listing](Images/Datalisting.png)
- [ER Diagram](Images/ERdiagram.png)

## GitHub And Team Work

GitHub links:

- Hriday Rajput: https://github.com/HridayRajput
- Raman Kumari: https://github.com/ramankumaree202-collab
- Vivek Chaudhary: https://github.com/VivekChaudhary880

Work division:

- Hriday: database schema, connection pool, JWT/`requireAdmin` middleware, Products resource.
- Raman: Express app structure, login/register/auth routes, protected route shell, Users management panel.
- Vivek: Orders resource, AI assistant (description + recommender), Tailwind styling for both panels.
