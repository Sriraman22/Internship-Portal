import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import appRoutes from "./routes/applications.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/auth", authRoutes);
app.use("/applications", appRoutes);

app.get("/", (req, res) => {
  res.send("✅ InternPortal Backend is running!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
