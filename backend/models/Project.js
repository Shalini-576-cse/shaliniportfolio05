const mongoose = require("mongoose");

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 600
  },
  tech: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  link: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
    validate: {
      validator: isHttpUrl,
      message: "Project link must be a valid HTTP or HTTPS URL."
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Project", projectSchema);
