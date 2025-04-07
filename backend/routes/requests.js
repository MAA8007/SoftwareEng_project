const express = require("express");
const router = express.Router();
const Request = require("../models/Request");

// Create new request (1 active request per user)
router.post("/", async (req, res) => {
  const { user, pickup, destination, description } = req.body;

  try {
    const activeRequest = await Request.findOne({ user, status: { $ne: "completed" } });
    if (activeRequest) {
      return res.status(400).json({ msg: "You already have an active request." });
    }

    const newRequest = new Request({ user, pickup, destination, description });
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all requests for a user
router.get("/:userId", async (req, res) => {
    try {
      console.log("Fetching requests for user:", req.params.userId);  // 👈 Add this
      const requests = await Request.find({ user: req.params.userId }).sort({ createdAt: -1 });
      res.json(requests);
    } catch (err) {
      console.error("Error fetching user requests:", err);  // 👈 Add this
      res.status(500).json({ msg: "Server error" });
    }
  });
  

// Get bids for a request
router.get("/bids/:requestId", async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    res.json(request.bids || []);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Accept a bid (update status)
router.patch("/:requestId", async (req, res) => {
  const { status } = req.body;
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.requestId,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Could not update request status" });
  }
});


// PATCH: Update request status (e.g., to "bid accepted" or "completed")
router.patch("/:requestId", async (req, res) => {
    const { status } = req.body;
    try {
      const updatedRequest = await Request.findByIdAndUpdate(
        req.params.requestId,
        { status },
        { new: true }
      );
      res.json(updatedRequest);
    } catch (err) {
      res.status(500).json({ msg: "Failed to update request status" });
    }
  });

// Select a bid
router.post("/select-bid", async (req, res) => {
    const { userId, bidId } = req.body;
  
    try {
      const request = await Request.findOne({ userId, status: "active" });
      if (!request) return res.status(404).json({ msg: "Active request not found." });
  
      request.selectedBid = bidId;
      request.status = "in progress";
      await request.save();
  
      res.json({ msg: "Bid selected successfully." });
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  });

module.exports = router;
