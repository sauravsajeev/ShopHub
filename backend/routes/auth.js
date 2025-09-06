import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js" 
const router = express.Router();

// Signup
// router.post("/signup", async (req, res) => {
//   console.log(req.body)
//   const { name, email, password } = req.body;
//   const existing = await User.findOne({ email });
//   if (existing) return res.status(400).json({ msg: "Email already exists" });

//   const hashed = await bcrypt.hash(password, 10);
//   const user = new User({ name, email, password: hashed });
//   await user.save();

//   const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);
//   res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
// });
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // sign token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
    console.log(req.body)
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
});

router.post("/logout", (req, res) => {
  // Since we're using JWT tokens, logout is handled client-side
  // This endpoint can be used for logging purposes or token blacklisting in the future
  res.json({ msg: "Logged out successfully" })
})
router.get("/check-admin", auth, (req, res) => {
  const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",") : ["admin@example.com"]
  const isAdmin = ADMIN_EMAILS.includes(req.user.email)
  res.json({ isAdmin, email: req.user.email })
})
export default router;
