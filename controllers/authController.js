import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    console.log("Req.body:", req.body);

    const { name, email, password, role } = req.body;

    
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Ky email është i regjistruar më parë" });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role || "user"]
    );

    res.status(201).json({ message: "Regjistrimi u krye me sukses" });
  } catch (err) {
    console.error("Gabim ne server (register):", err);
    res.status(500).json({ message: "Gabim ne server", error: err.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res
        .status(400)
        .json({ message: "Email ose fjalëkalim i gabuar" });
    }

    const user = users[0];

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email ose fjalëkalim i gabuar" });
    }

    
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    
    res.json({
      message: "Login i suksesshëm",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Gabim ne server gjate login:", err);
    res.status(500).json({ message: "Gabim ne server", error: err.message });
  }
};