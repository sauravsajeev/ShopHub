import mongoose from "mongoose"

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  brand: { type: String, default: "" },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  stock: { type: Number, default: 0 },
  tags: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.model("Item", itemSchema)
