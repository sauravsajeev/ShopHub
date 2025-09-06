import express from "express";
import Cart from "../models/Cart.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get cart
router.get("/", auth, async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user.id }).populate("items.itemId");
  if (!cart) cart = new Cart({ userId: req.user.id, items: [] });
  await cart.save();
  res.json(cart);
});

// Add/update item
router.post("/add", auth, async (req, res) => {
  const { itemId, qty } = req.body;
  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

  const existing = cart.items.find(i => i.itemId.toString() === itemId);
  if (existing) existing.qty = qty;
  else cart.items.push({ itemId, qty });

  await cart.save();
  res.json(cart);
});

// Remove item
router.post("/remove", auth, async (req, res) => {
  const { itemId } = req.body;
  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) return res.json({ msg: "Cart empty" });

  cart.items = cart.items.filter(i => i.itemId.toString() !== itemId);
  await cart.save();
  res.json(cart);
});

export default router;
