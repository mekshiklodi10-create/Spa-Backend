import supabase from "../config/db.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Të dhënat janë të detyrueshme" });
    }

    // 1️⃣ Krijo user me Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } } // metadata
    });

    if (error) throw error;

    // 2️⃣ Ruaj user në tabelën users
    await supabase
      .from("users")
      .insert([{ id: data.user.id, name, email, role: 'user' }]);

    res.status(201).json({
      message: "Regjistrimi u krye me sukses",
      userId: data.user.id
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

    // 1️⃣ Login me Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(400).json({ message: "Email ose fjalëkalim i gabuar" });

    const userId = data.user.id;

    // 2️⃣ Merr role nga tabela users
    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    res.json({
      message: "Login i suksesshëm",
      token: data.session?.access_token,
      user: {
        id: userId,
        email: data.user.email,
        name: data.user.user_metadata.name,
        role: userRow.role // ky është kyç për dashboard
      }
    });

  } catch (err) {
    console.error("Gabim ne server (login):", err);
    res.status(500).json({ message: "Gabim ne server", error: err.message });
  }
};