import express from "express";
import cors from "cors";

// Import route files.
import customerRoutes from "./routes/customerRoutes";
import orderRoutes from "./routes/orderRoutes";
import productRoutes from "./routes/productRoutes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/orders", orderRoutes);
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);

// ─── START SERVER ─────────────────────────────────────
app.listen(3001, () => {
console.log("Server running on http://localhost:3001");
});