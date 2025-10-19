import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import appRoutes from "./routes/applications.js";
import genaiRoutes from "./routes/genai.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/auth", authRoutes);
app.use("/applications", appRoutes);
app.use("/api/genai", genaiRoutes); // ✅ Moved this BELOW app definition

// Health Check
app.get("/", (req, res) => {
  res.send("✅ InternPortal Backend is running!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
