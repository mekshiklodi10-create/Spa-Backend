import supabase from "../config/db.js";
import bcrypt from "bcrypt";

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Të dhënat janë të detyrueshme" });
    }

    // kontrollo nëse ekziston
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return res.status(400).json({ message: "Email ekziston" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase.from("users").insert([
      {
        name,
        email,
        password: hashedPassword,
        role: "user"
      }
    ]);

    if (error) throw error;

    res.status(201).json({ message: "Regjistrimi u krye me sukses" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gabim në server" });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: "Email ose password i gabuar" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Email ose password i gabuar" });
    }

    res.json({
      message: "Login i suksesshëm",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gabim në server" });
  }
};
