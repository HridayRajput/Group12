// ─────────────────────────────────────────────────────────
//  DATABASE CONNECTION
//  This file creates a MySQL connection pool and exports it.
//  Every route file imports "pool" from here.
// ─────────────────────────────────────────────────────────

// Import the mysql2 driver with promise support (lets us use async/await).
import mysql from "mysql2/promise";

// Create a connection pool.
// A pool keeps multiple connections open and reuses them.
// This is more efficient than opening a new connection for every query.
const pool = mysql.createPool({
  host: "localhost",       // where MySQL is running
  user: "root",             // your MySQL username
  password: "",              // your MySQL password
  database: "group12_app",     // the database we created above
});

// Export the pool so other files can import it:
//   import pool from "./db";
export default pool;