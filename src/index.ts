import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import customerRoutes from "./routes/customerRoutes";
import orderRoutes from "./routes/orderRoutes";
import productRoutes from "./routes/productRoutes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/orders", orderRoutes);
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);

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
