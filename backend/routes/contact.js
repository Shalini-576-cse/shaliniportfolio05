const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

router.post("/", async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.json({ success: true, message: "Saved successfully" });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;