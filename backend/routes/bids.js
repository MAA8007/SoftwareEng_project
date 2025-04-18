const express = require("express");
const Bid = require("../models/Bid");
const Request = require("../models/Request");

const router = express.Router();

// POST a new bid for a request
router.post("/", async (req, res) => {
  const { requestId, deliveryPerson, price, eta } = req.body;

  try {
    const bid = new Bid({ request: requestId, deliveryPerson, price, eta });
    await bid.save();

    // Push bid into request.bids array
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ msg: "Request not found." });

    request.bids.push(bid);
    await request.save();

    res.status(201).json(bid);
  } catch (err) {
    res.status(500).json({ msg: "Error creating bid", error: err.message });
  }
});

// GET all bids for a request
router.get("/:requestId", async (req, res) => {
  try {
    const bids = await Bid.find({ request: req.params.requestId }).populate("deliveryPerson", "username email");
    res.json(bids);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch bids" });
  }
});

module.exports = router;
