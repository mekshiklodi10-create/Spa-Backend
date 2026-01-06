import supabase from "../config/db.js";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, photoUrl } = req.body;

    if (!email || !password || !name)
      return res.status(400).json({ message: "Të dhënat janë të detyrueshme" });

    // Krijo user me Supabase Admin
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // User direkt i konfirmuar
      user_metadata: { name, role, phone, address, photoUrl },
    });

    if (error) throw error;

    const userId = data.user.id;

    // Shto user metadata në tabelën 'users'
    const { error: profileError } = await supabase.from("users").insert([
      {
        id: userId,
        name,
        role,
        phone,
        address,
        photo_url: photoUrl,
      },
    ]);

    if (profileError) throw profileError;

    res.status(201).json({
      message: "Regjistrimi u krye me sukses",
      userId: userId,
    });
  } catch (err) {
    console.error("Gabim ne server (register):", err);
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email dhe fjalëkalimi janë të detyrueshëm" });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(400).json({ message: "Email ose fjalëkalim i gabuar" });

    const user = data.user;

    // Merr metadata nga tabela 'users'
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    res.json({
      message: "Login i suksesshëm",
      token: data.session?.access_token,
      user: {
        id: user.id,
        email: user.email,
        ...profileData,
        photoUrl: profileData.photo_url, // snake → camel
      },
    });
  } catch (err) {
    console.error("Gabim ne server gjate login:", err);
    res.status(500).json({ message: err.message });
  }
};
