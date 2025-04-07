const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  deliveryPerson: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  price: Number,
  eta: String,
  createdAt: { type: Date, default: Date.now }
});

const requestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pickup: { type: String, required: true },
  destination: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["active", "bid accepted", "completed"], default: "active" },
  bids: [bidSchema],
  selectedBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bid",
    default: null,
  },
  createdAt: { type: Date, default: Date.now }
});

// ✅ THIS LINE IS ESSENTIAL:
module.exports = mongoose.model("Request", requestSchema);
