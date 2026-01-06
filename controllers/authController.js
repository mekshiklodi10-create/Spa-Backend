import supabase from "../config/db.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Të dhënat janë të detyrueshme" });
    }

    // Krijo user në Supabase (vetëm name tek metadata)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
    });

    if (error) throw error;

    res.status(201).json({
      message: "Regjistrimi u krye me sukses",
      userId: data.id
    });
  } catch (err) {
    console.error("Gabim ne server (register):", err);
    res.status(500).json({ message: "Gabim ne server", error: err.message });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email dhe fjalëkalimi janë të detyrueshëm" });
    }

    // Sign in me Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return res.status(400).json({ message: "Email ose fjalëkalim i gabuar" });

    const user = data.user;

    // Kthe token dhe metadata të user-it
    res.json({
      message: "Login i suksesshëm",
      token: data.session?.access_token,
      user: {
        id: user.id,
        email: user.email,
        ...user.user_metadata // p.sh. name
      }
    });
  } catch (err) {
    console.error("Gabim ne server (login):", err);
    res.status(500).json({ message: "Gabim ne server", error: err.message });
  }
};
