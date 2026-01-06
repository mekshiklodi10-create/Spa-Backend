import supabase from "../config/db.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Të dhënat janë të detyrueshme" });
  }

  try {
    // 1️⃣ Krijo user në Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } } // metadata
    });

    if (authError) throw authError;

    // 2️⃣ Shto userin në tabelën "users"
    const { data: userRow, error: userError } = await supabase
      .from("users")
      .insert([
        {
          supabase_id: authData.user.id,
          name,
          email,
          role: 'user' // default role
        }
      ])
      .select()
      .single();

    if (userError) throw userError;

    res.status(201).json({
      message: "Regjistrimi u krye me sukses",
      userId: authData.user.id
    });

  } catch (err) {
    console.error("Gabim ne server (register):", err);
    res.status(500).json({ message: "Gabim ne server", error: err.message });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dhe fjalëkalimi janë të detyrueshëm" });
  }

  try {
    // 1️⃣ Sign in me Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ message: "Email ose fjalëkalim i gabuar" });

    const user = data.user;

    // 2️⃣ Merr role dhe të dhëna nga tabela "users"
    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("supabase_id", user.id)
      .single();

    if (userError) {
      return res.status(400).json({ message: "Useri nuk është i regjistruar në sistem" });
    }

    // 3️⃣ Kthe token dhe user info
    res.json({
      message: "Login i suksesshëm",
      token: data.session?.access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || null,
        role: userRow.role
      }
    });

  } catch (err) {
    console.error("Gabim ne server (login):", err);
    res.status(500).json({ message: "Gabim ne server", error: err.message });
  }
};