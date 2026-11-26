const express = require("express");
const router = express.Router();

const Feedback = require("../models/Feedback");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { mealType, rating, comment } = req.body;

    if (!mealType || !rating || !comment || !comment.trim()) {
      return res.status(400).json({
        message: "Please fill all feedback fields.",
      });
    }

    if (!["Breakfast", "Lunch", "Dinner"].includes(mealType)) {
      return res.status(400).json({
        message: "Invalid meal type.",
      });
    }

    if (
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5.",
      });
    }

    const feedback = await Feedback.create({
      student: req.user.id,
      mealType,
      rating: Number(rating),
      comment: comment.trim(),
    });

    res.status(201).json({
      message: "Feedback submitted successfully!",
      feedback,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit feedback.",
      error: error.message,
    });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      student: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({ feedbacks });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch feedback.",
      error: error.message,
    });
  }
});

module.exports = router;
