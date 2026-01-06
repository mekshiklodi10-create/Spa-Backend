import supabase from "../config/db.js";
import { v4 as uuidv4 } from "uuid"; // për id unike tek tabela users

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Të dhënat janë të detyrueshme" });
    }

    // 1️⃣ Krijo user në Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } } // metadata
    });

    if (authError) throw authError;

    // 2️⃣ Shto user në tabelën users me rolin default 'user'
    const { error: dbError } = await supabase
      .from("users")
      .insert([{
        id: uuidv4(),            // ID e vetme për tabelën users
        supabase_id: authData.user.id,
        name,
        email,
        role: 'user'             // role default
      }]);

    if (dbError) throw dbError;

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
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email dhe fjalëkalimi janë të detyrueshëm" });
    }

    // 1️⃣ Sign in tek Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) return res.status(400).json({ message: "Email ose fjalëkalim i gabuar" });

    const userAuth = authData.user;

    // 2️⃣ Merr të dhënat nga tabela users për rolin
    const { data: userDb, error: dbError } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("supabase_id", userAuth.id)
      .single();

    if (dbError) throw dbError;

    res.json({
      message: "Login i suksesshëm",
      token: authData.session?.access_token,
      user: {
        id: userDb.id,
        email: userDb.email,
        name: userDb.name,
        role: userDb.role
      }
    });
  } catch (err) {
    console.error("Gabim ne server (login):", err);
    res.status(500).json({ message: "Gabim ne server", error: err.message });
  }
};