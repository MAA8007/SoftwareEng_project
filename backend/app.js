const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors"); // ← ADD THIS
const authRoutes = require("./routes/auth");

dotenv.config(); // Load .env variables

const app = express();
app.use(cors()); // ← ENABLE CORS
app.use(express.json()); // For JSON body parsing

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

const requestRoutes = require("./routes/requests");
app.use("/api/requests", requestRoutes);

const bidRoutes = require("./routes/bids");
app.use("/api/bids", bidRoutes);