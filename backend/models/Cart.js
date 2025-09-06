import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    { itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" }, qty: Number }
  ],
});

export default mongoose.model("Cart", cartSchema);
