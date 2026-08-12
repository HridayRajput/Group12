# Group 12 Electronics Store

Group members:
- Hriday Rajput — https://github.com/HridayRajput
- Raman Kumari — https://github.com/ramankumaree202-collab
- Vivek Chaudhary — https://github.com/VivekChaudhary880

## Project summary

A full-stack electronics store built for the REST API mini capstone. The backend
provides secure, parameterized CRUD endpoints for products, customers, orders, and
user accounts, protected by JWT cookie authentication with role-based (admin/member)
authorization. The frontend is a React + Tailwind SPA with a login/register flow, a
role-aware Admin panel (full catalog/customer/order/user management) and Member panel
(catalog browsing, order placement, favorites), plus an AI product-description and
recommendation assistant.

## Setup

1. Run `schema.sql` in MySQL to create the database and tables.
2. Run `seed.sql` (after `schema.sql`) to load sample products/customers and demo accounts.
3. Copy `.env.example` to `.env` and fill in your local values.
4. Install backend dependencies: `npm install` in the repository root.
5. Install frontend dependencies: `npm install` inside `frontend/`.

### Environment variables

| Variable | Description |
|---|---|
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection values |
| `PORT` | Backend port, default `3001` |
| `CLIENT_ORIGIN` | Frontend origin for cookie-based auth, default `http://localhost:5173` |
| `JWT_SECRET` | Required secret used to sign session tokens |
| `AI_API_BASE_URL` | Chat completions endpoint for any OpenAI-compatible provider (Groq, OpenAI, etc.) |
| `AI_API_KEY` | Optional key for the AI description/recommendation helper. Leave empty to use the local fallback |
| `AI_MODEL` | Model name for the configured provider |

## Run locally

- Backend: `npm run dev` (http://localhost:3001)
- Frontend: `npm run dev --prefix frontend` (http://localhost:5173)
- Production builds: `npm run build` and `npm run build --prefix frontend`

## Test accounts

| Role | Username / Email | Password |
|---|---|---|
| Admin | `hridayrajput` / `hriday.rajput@example.com` | `Admin@123` |
| Admin | `ramankumaree202-collab` / `raman.kumari@example.com` | `Admin@123` |
| Admin | `VivekChaudhary880` / `vivek.chaudhary@example.com` | `Admin@123` |
| Member | `userpanel` / `user@example.com` | `User@123` |

## API endpoints

All write endpoints use parameterized queries and return the appropriate HTTP status
code (200/201/400/403/404/500).

### Auth (`/auth`)
| Method | Path | Access | Description |
|---|---|---|---|
| POST | /auth/login | Public | Log in, sets an httpOnly JWT cookie |
| POST | /auth/register | Public | Register a member account (auto-links a Customer profile) |
| GET | /auth/me | Authenticated | Return the signed-in user |
| POST | /auth/logout | Authenticated | Clear the auth cookie |
| GET | /auth/users | Admin | List all user accounts |
| PATCH | /auth/users/:id/role | Admin | Promote/revoke admin access |

### Products (`/products`)
| Method | Path | Access | Description |
|---|---|---|---|
| GET | /products | Authenticated | List products |
| GET | /products/:id | Authenticated | Get one product |
| POST | /products | Admin | Create a product |
| PUT | /products/:id | Admin | Update a product |
| DELETE | /products/:id | Admin | Delete a product |

### Customers (`/customers`)
| Method | Path | Access | Description |
|---|---|---|---|
| GET | /customers/lookup | Authenticated | Lightweight id/name list (used by the order form) |
| GET | /customers | Admin | List customers with full contact details |
| GET | /customers/:id | Admin | Get one customer |
| POST | /customers | Admin | Create a customer |
| PUT | /customers/:id | Admin | Update a customer |
| DELETE | /customers/:id | Admin | Delete a customer |

### Orders (`/orders`)
| Method | Path | Access | Description |
|---|---|---|---|
| GET | /orders | Authenticated | List orders |
| GET | /orders/:id | Authenticated | Get one order |
| POST | /orders | Authenticated | Create an order (members are always placed as themselves) |
| PUT | /orders/:id | Admin | Update an order |
| DELETE | /orders/:id | Admin | Delete an order |

### AI helper (`/ai`)
| Method | Path | Access | Description |
|---|---|---|---|
| POST | /ai/product-description | Authenticated | Generate product marketing copy |
| POST | /ai/recommend | Authenticated | Recommend an in-stock product for a budget/category |

## Security notes

- Passwords are hashed with `bcryptjs` before storage; plain-text passwords are never stored or logged.
- Auth uses a signed JWT stored in an httpOnly cookie (`sameSite: lax`, `secure` in production).
- Login and registration are rate-limited (5 attempts / 15 minutes per IP).
- Every user account is linked to its own `Customers` row via `customerId`; members can only ever place orders under their own identity, enforced server-side regardless of what the client sends.
- Admin-only routes are enforced by backend middleware (`requireAdmin`), not just hidden in the UI.

## Testing the API (PowerShell)

```powershell
# Auth
Invoke-WebRequest -Uri http://localhost:3001/auth/login -Method POST -ContentType "application/json" -Body '{"identifier":"userpanel","password":"User@123"}'

# Products
Invoke-WebRequest -Uri http://localhost:3001/products -Method GET
Invoke-WebRequest -Method POST -Uri http://localhost:3001/products -ContentType "application/json" -Body '{"name":"Sample Product","category":"Electronics","brand":"BrandX","description":"A sample description","price":99.99,"stockQuantity":50}'
Invoke-WebRequest -Method PUT -Uri http://localhost:3001/products/1 -ContentType "application/json" -Body '{"name":"Updated Product","category":"Electronics","brand":"BrandX","description":"An updated description","price":89.99,"stockQuantity":30}'
Invoke-WebRequest -Method DELETE -Uri http://localhost:3001/products/1

# Customers
Invoke-WebRequest -Uri http://localhost:3001/customers -Method GET
Invoke-WebRequest -Method POST -Uri http://localhost:3001/customers -ContentType "application/json" -Body '{"firstName":"John","lastName":"Doe","email":"john.doe@example.com","phone":"123-456-7890","address":"123 Main St"}'

# Orders
Invoke-WebRequest -Uri http://localhost:3001/orders -Method GET
Invoke-WebRequest -Uri http://localhost:3001/orders -Method POST -Body '{"customerId":1,"productId":2,"quantity":3,"totalPrice":29.99}' -ContentType "application/json"
```

## Team responsibilities

**Hriday Rajput** — MySQL schema and connection pool, JWT auth middleware and
`requireAdmin` authorization, Products resource (backend + frontend panel).

**Raman Kumari** — Express app structure, login/register/auth routes, protected
route shell, Users management panel, documentation.

**Vivek Chaudhary** — Orders resource (backend + frontend panel), AI assistant
(description generator + recommender), Tailwind styling for both Admin and Member
panels, wireframes.
