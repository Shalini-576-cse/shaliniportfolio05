const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Message = require("../models/Message");
const rateLimit = require("../middleware/rateLimit");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many messages. Please try again later."
});

router.post("/", contactLimiter, async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields."
      });
    }

    if (name.length > 80 || email.length > 120 || message.length > 1000 || !emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid contact details."
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Contact form is temporarily unavailable."
      });
    }

    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    res.json({ success: true, message: "Saved successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to save message." });
  }
});

module.exports = router;
