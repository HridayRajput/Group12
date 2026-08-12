import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import pool from "../db";
import {
  AUTH_COOKIE_NAME,
  authenticateToken,
  clearAuthCookie,
  requireAdmin,
  signAuthToken,
  type AuthenticatedUser,
} from "../auth";

const isValidId = (id: unknown): id is string => typeof id === "string" && /^\d+$/.test(id);

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const sanitizeUser = (user: AuthenticatedUser) => ({
  userId: user.userId,
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  role: user.role,
  customerId: user.customerId,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

router.post("/login", loginLimiter, async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: "identifier and password are required" });
  }

  const [rows] = await pool.query(
    "SELECT userId, fullName, username, email, passwordHash, role, customerId FROM Users WHERE username = ? OR email = ? LIMIT 1",
    [identifier, identifier]
  );

  const users = rows as Array<{
    userId: number;
    fullName: string;
    username: string;
    email: string;
    passwordHash: string;
    role: string;
    customerId: number | null;
  }>;

  if (users.length === 0) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = users[0]!;
  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const tokenUser: AuthenticatedUser = {
    userId: user.userId,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    role: user.role,
    customerId: user.customerId,
  };

  const token = signAuthToken(tokenUser);

  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60 * 1000,
  });

  return res.json({ user: sanitizeUser(tokenUser) });
});

router.post("/register", registerLimiter, async (req: Request, res: Response) => {
  const { fullName, username, email, password } = req.body;

  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ error: "fullName, username, email, and password are required" });
  }

  const normalizedUsername = String(username).trim();
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedFullName = String(fullName).trim();

  if (!normalizedFullName || !normalizedUsername || !normalizedEmail || String(password).trim().length < 6) {
    return res.status(400).json({ error: "Please provide valid registration details" });
  }

  const [existingRows] = await pool.query(
    "SELECT userId FROM Users WHERE username = ? OR email = ? LIMIT 1",
    [normalizedUsername, normalizedEmail]
  );

  const existingUsers = existingRows as Array<{ userId: number }>;

  if (existingUsers.length > 0) {
    return res.status(409).json({ error: "An account with that username or email already exists" });
  }

  const passwordHash = await bcrypt.hash(String(password), 10);

  const nameParts = normalizedFullName.split(/\s+/);
  const customerFirstName = nameParts[0]!;
  const customerLastName = nameParts.slice(1).join(" ") || customerFirstName;

  let customerId: number;

  try {
    const [customerResult] = await pool.query(
      "INSERT INTO Customers (firstName, lastName, email) VALUES (?, ?, ?)",
      [customerFirstName, customerLastName, normalizedEmail]
    );
    customerId = (customerResult as { insertId: number }).insertId;
  } catch (customerError: any) {
    if (customerError.errno !== 1062) {
      throw customerError;
    }

    const [existingCustomerRows] = await pool.query(
      "SELECT customerId FROM Customers WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );
    customerId = (existingCustomerRows as Array<{ customerId: number }>)[0]!.customerId;
  }

  const [result] = await pool.query(
    "INSERT INTO Users (fullName, username, email, passwordHash, role, customerId) VALUES (?, ?, ?, ?, 'member', ?)",
    [normalizedFullName, normalizedUsername, normalizedEmail, passwordHash, customerId]
  );

  const insertedId = (result as { insertId: number }).insertId;
  const tokenUser: AuthenticatedUser = {
    userId: insertedId,
    fullName: normalizedFullName,
    username: normalizedUsername,
    email: normalizedEmail,
    role: "member",
    customerId,
  };

  const token = signAuthToken(tokenUser);

  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60 * 1000,
  });

  return res.status(201).json({ user: sanitizeUser(tokenUser) });
});

router.get("/me", authenticateToken, (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  return res.json({ user: sanitizeUser(req.user) });
});

router.post("/logout", (req: Request, res: Response) => {
  clearAuthCookie(res);
  return res.json({ message: "Logged out successfully" });
});

router.get("/users", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const [rows] = await pool.query(
    "SELECT userId, fullName, username, email, role, createdAt FROM Users ORDER BY userId ASC"
  );

  return res.json(rows);
});

router.patch("/users/:id/role", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  if (role !== "admin" && role !== "member") {
    return res.status(400).json({ error: "role must be 'admin' or 'member'" });
  }

  const [result] = await pool.query("UPDATE Users SET role = ? WHERE userId = ?", [role, id]);

  if ((result as { affectedRows: number }).affectedRows === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({ userId: Number(id), role });
});

export default router;