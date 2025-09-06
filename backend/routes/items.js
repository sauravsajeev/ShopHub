import express from "express"
import Item from "../models/Item.js"
import auth from "../middleware/auth.js"
import dotenv from "dotenv";
dotenv.config();
const router = express.Router()

router.get("/", async (req, res) => {
  const {
    page = 1,
    limit = 12,
    min_price,
    max_price,
    category,
    brand,
    min_rating,
    q,
    sort_by = "createdAt",
    sort_order = "desc",
  } = req.query

  const filter = {}

  if (min_price || max_price) filter.price = {}
  if (min_price) filter.price.$gte = Number.parseFloat(min_price)
  if (max_price) filter.price.$lte = Number.parseFloat(max_price)
  if (category) filter.category = category
  if (brand) filter.brand = brand
  if (min_rating) filter.rating = { $gte: Number.parseFloat(min_rating) }
  if (q)
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { tags: { $in: [new RegExp(q, "i")] } },
    ]

  const sortOptions = {}
  sortOptions[sort_by] = sort_order === "desc" ? -1 : 1

  try {
    const items = await Item.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number.parseInt(limit))
      .populate("createdBy", "name email")

    const total = await Item.countDocuments(filter)

    res.json({
      items,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message })
  }
})
router.get("/filters", async (req, res) => {
  try {
    const categories = await Item.distinct("category")
    const brands = await Item.distinct("brand")
    res.json({ categories, brands })
  } catch (error) {
    res.status(500).json({ msg: "Server error" })
  }
})
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("createdBy", "name email")

    if (!item) {
      return res.status(404).json({ msg: "Item not found" })
    }

    res.json(item)
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(404).json({ msg: "Item not found" })
    }
    res.status(500).json({ msg: "Server error", error: error.message })
  }
})



const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map(e => e.trim()) : ["admin@example.com"]

router.post("/", auth, async (req, res) => {
    console.log("User from auth middleware:", req.user);
  try {
    // Check if user email is in admin list
  if (!ADMIN_EMAILS.some(e => e.toLowerCase() === req.user.email.toLowerCase())) {
  return res.status(403).json({ msg: "Access denied. Admin privileges required." });
}

    const itemData = {
      ...req.body,
      createdBy: req.user.id,
      updatedAt: new Date(),
    }

    const item = new Item(itemData)
    await item.save()
    await item.populate("createdBy", "name email")

    res.json(item)
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message })
  }
})

// Update
router.put("/:id", auth, async (req, res) => {
  try {
    if (!ADMIN_EMAILS.includes(req.user.email)) {
      return res.status(403).json({ msg: "Access denied. Admin privileges required." })
    }

    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true },
    ).populate("createdBy", "name email")

    if (!updated) {
      return res.status(404).json({ msg: "Item not found" })
    }

    res.json(updated)
  } catch (error) {
    res.status(500).json({ msg: "Server error" })
  }
})

// Delete
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!ADMIN_EMAILS.includes(req.user.email)) {
      return res.status(403).json({ msg: "Access denied. Admin privileges required." })
    }

    const deleted = await Item.findByIdAndDelete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ msg: "Item not found" })
    }

    res.json({ msg: "Item deleted successfully" })
  } catch (error) {
    res.status(500).json({ msg: "Server error" })
  }
})

export default router
