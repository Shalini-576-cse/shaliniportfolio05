const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const router = express.Router();
const Project = require("../models/Project");
const rateLimit = require("../middleware/rateLimit");

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many admin requests. Please try again later."
});

function cleanProject(input) {
  const body = input && typeof input === "object" ? input : {};

  return {
    title: typeof body.title === "string" ? body.title.trim() : "",
    description: typeof body.description === "string" ? body.description.trim() : "",
    tech: typeof body.tech === "string" ? body.tech.trim() : "",
    link: typeof body.link === "string" ? body.link.trim() : ""
  };
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function isAuthorized(authHeader) {
  const expectedToken = process.env.ADMIN_TOKEN;
  const providedToken = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : "";

  if (!expectedToken || !providedToken) {
    return false;
  }

  const expected = Buffer.from(expectedToken);
  const provided = Buffer.from(providedToken);

  return expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
}

const fallbackProjects = [
  {
    title: "Portfolio Website",
    description: "A responsive personal portfolio with a Node.js backend and contact form.",
    tech: "HTML, CSS, JavaScript, Node.js, Express, MongoDB",
    link: ""
  },
  {
    title: "Web Development Projects",
    description: "Frontend and full-stack work focused on clean UI, usability, and modern web apps.",
    tech: "React, Node.js, MongoDB, UI/UX",
    link: ""
  }
];

// GET all projects
router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(fallbackProjects);
    }

    const projects = await Project.find().sort({ _id: -1 });
    res.json(projects.length ? projects : fallbackProjects);
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to load projects." });
  }
});

// POST new project
router.post("/", adminLimiter, async (req, res) => {
  try {
    if (!isAuthorized(req.headers.authorization)) {
      return res.status(401).json({ success: false, error: "Unauthorized." });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: "Database unavailable." });
    }

    const { title, description, tech, link } = cleanProject(req.body);

    if (!title || !description || !tech || !link) {
      return res.status(400).json({ success: false, error: "All project fields are required." });
    }

    if (
      title.length > 120 ||
      description.length > 600 ||
      tech.length > 200 ||
      link.length > 500 ||
      !isValidUrl(link)
    ) {
      return res.status(400).json({ success: false, error: "Invalid project details." });
    }

    const newProject = new Project({ title, description, tech, link });
    await newProject.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to save project." });
  }
});

module.exports = router;
