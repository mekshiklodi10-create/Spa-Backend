import supabase from "../config/db.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Të dhënat janë të detyrueshme" });
    }

    // Krijo user në Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: "user" },
    });

    if (error) throw error;

    // Fut user në tabelën lokale
    const { error: insertError } = await supabase
      .from("users")
      .insert([{ supabase_id: data.id, name, email, role: "user" }]);

    if (insertError) throw insertError;

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

    const userSupabaseId = data.user.id;

    // Merr user nga tabela lokale
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("supabase_id", userSupabaseId)
      .single();

    if (userError) throw userError;

    res.json({
      message: "Login i suksesshëm",
      token: data.session?.access_token,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      }
    });
  } catch (err) {
    console.error("Gabim ne server (login):", err);
    res.status(500).json({ message: "Gabim ne server", error: err.message });
  }
};
