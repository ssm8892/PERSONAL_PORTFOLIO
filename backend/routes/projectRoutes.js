const express = require("express");
const Project = require("../models/Project");  // Ensure model is correctly imported

const router = express.Router();

// GET all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find(); // Fetch all projects from MongoDB
    res.json(projects);  // Send as JSON response
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
