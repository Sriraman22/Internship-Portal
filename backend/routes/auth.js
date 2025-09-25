// backend/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getPool } from "../db.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { name, email, password, role = "Student" } = req.body;
  try {
    const pool = await getPool();

    // Check if email exists
    const check = await pool
      .request()
      .input("email", email)
      .query("SELECT id FROM Users WHERE email=@email");

    if (check.recordset.length) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool
      .request()
      .input("name", name)
      .input("email", email)
      .input("password", hashed)
      .input("role", role)
      .query(
        "INSERT INTO Users (name,email,password,role) OUTPUT INSERTED.id VALUES (@name,@email,@password,@role)"
      );

    res.json({ id: result.recordset[0].id, message: "✅ User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("email", email)
      .query("SELECT * FROM Users WHERE email=@email");

    if (!result.recordset.length) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.recordset[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
