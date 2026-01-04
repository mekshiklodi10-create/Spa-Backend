import supabase from "../config/db.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "Nuk ka token" });

    const token = authHeader.replace("Bearer ", "");

    // Merr user nga Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user)
      return res.status(403).json({ message: "Token jo valid" });

    req.user = data.user; // user_metadata përfshin role
    next();
  } catch (err) {
    console.error("verifyToken error:", err);
    res.status(500).json({ message: "Gabim serveri" });
  }
};

export const verifyAdmin = async (req, res, next) => {
  await verifyToken(req, res, async () => {
    const role = req.user.user_metadata?.role;
    if (role !== "admin")
      return res.status(403).json({ message: "Vetëm admin mund të hyjë" });
    next();
  });
};
