import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import { authenticateToken } from "./auth";
import aiRoutes from "./routes/aiRoutes";
import authRoutes from "./routes/authRoutes";
import customerRoutes from "./routes/customerRoutes";
import orderRoutes from "./routes/orderRoutes";
import productRoutes from "./routes/productRoutes";

const app = express();
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/ai", authenticateToken, aiRoutes);
app.use("/orders", authenticateToken, orderRoutes);
app.use("/customers", authenticateToken, customerRoutes);
app.use("/products", authenticateToken, productRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
