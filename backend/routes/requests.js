const express = require("express");
const router = express.Router();
const Request = require("../models/Request");

// Create a new request (only one active per customer)
router.post("/", async (req, res) => {
  const io = req.app.get("socketio");
  const { user, pickup, destination, description } = req.body;
  try {
    const existing = await Request.findOne({ user, status: { $ne: "completed" } });
    if (existing) return res.status(400).json({ msg: "You already have an active request." });

    const newRequest = new Request({ user, pickup, destination, description });
    await newRequest.save();

    io.emit("new_request", newRequest); // Notify delivery dashboards
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all requests for a specific customer (customer dashboard)
router.get("/user/:userId", async (req, res) => {
  try {
    const requests = await Request.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error("User requests error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all active requests for delivery dashboard
router.get("/active", async (req, res) => {
  const { deliveryPersonId } = req.query;
  try {
    const available = await Request.find({
      status: "active",
      selectedBid: null
    });
    const assigned = await Request.find({
      assignedDeliveryPerson: deliveryPersonId,
      status: { $ne: "completed" }
    }).populate("bids.deliveryPerson", "username");
    res.json([...assigned, ...available]);
  } catch (err) {
    console.error("Active fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Submit a bid
router.post("/:requestId/bid", async (req, res) => {
  const io = req.app.get("socketio");
  const { deliveryPerson, price, eta } = req.body;
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    request.bids.push({ deliveryPerson, price, eta });
    await request.save();

    io.emit("new_bid", { requestId: request._id }); // Notify customer dashboard
    res.json({ msg: "Bid submitted successfully." });
  } catch (err) {
    console.error("Submit bid error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all bids for a specific request
router.get("/:requestId/bids", async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId).populate("bids.deliveryPerson", "username email");
    if (!request) return res.status(404).json({ msg: "Request not found" });
    res.json(request.bids || []);
  } catch (err) {
    console.error("Bids fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Accept a bid
router.post("/select-bid", async (req, res) => {
  const io = req.app.get("socketio");
  const { userId, bidId } = req.body;
  try {
    const request = await Request.findOne({ user: userId, status: "active" });
    if (!request) return res.status(404).json({ msg: "Active request not found" });

    const selected = request.bids.find(b => b._id.toString() === bidId);
    if (!selected) return res.status(400).json({ msg: "Bid not found" });

    request.selectedBid = bidId;
    request.assignedDeliveryPerson = selected.deliveryPerson;
    request.status = "confirmed";
    await request.save();

    io.emit("bid_accepted", {
      requestId: request._id,
      deliveryPersonId: selected.deliveryPerson
    });

    res.json({ msg: "Bid accepted." });
  } catch (err) {
    console.error("Select bid error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update request status
router.patch("/:requestId/status", async (req, res) => {
  const io = req.app.get("socketio");
  const { status } = req.body;
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.requestId,
      { status },
      { new: true }
    );
    io.emit("request_status_updated", updated);
    res.json(updated);
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ msg: "Failed to update status" });
  }
});

// Cancel a request
router.patch("/:requestId/cancel", async (req, res) => {
  const io = req.app.get("socketio");
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    if (request.status !== "active") {
      return res.status(400).json({ msg: "Cannot cancel request after a bid has been accepted." });
    }

    request.status = "canceled";
    await request.save();

    io.emit("request_canceled", { requestId: request._id });
    res.json({ msg: "Request canceled successfully." });
  } catch (err) {
    console.error("Cancel request error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
