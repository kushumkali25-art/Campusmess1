const express = require("express");
const router = express.Router();

const MealAttendance = require("../models/MealAttendance");
const authMiddleware = require("../middleware/authMiddleware");

const mealDeadlines = {
  Breakfast: "06:30",
  Lunch: "10:30",
  Dinner: "17:30",
};

const getIndiaDateTime = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = {};

  parts.forEach((part) => {
    values[part.type] = part.value;
  });

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
};

router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({
        message: "Only students can submit meal attendance.",
      });
    }

    const { mealType, status } = req.body;

    if (!["Breakfast", "Lunch", "Dinner"].includes(mealType)) {
      return res.status(400).json({
        message: "Invalid meal type.",
      });
    }

    if (!["Will Eat", "Skip"].includes(status)) {
      return res.status(400).json({
        message: "Invalid attendance status.",
      });
    }

    const { date, time } = getIndiaDateTime();
    const deadline = mealDeadlines[mealType];

    if (time >= deadline) {
      return res.status(400).json({
        message: `${mealType} response deadline has passed.`,
      });
    }

    const attendance = await MealAttendance.findOneAndUpdate(
      {
        student: req.user.id,
        mealType,
        date,
      },
      {
        $set: { status },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      message: "Meal attendance saved successfully!",
      attendance,
    });
  } catch (error) {
    console.error("Meal attendance error:", error.message);

    res.status(500).json({
      message: "Failed to save meal attendance.",
    });
  }
});

router.delete("/:mealType", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({
        message: "Only students can cancel meal attendance.",
      });
    }

    const { mealType } = req.params;

    if (!["Breakfast", "Lunch", "Dinner"].includes(mealType)) {
      return res.status(400).json({
        message: "Invalid meal type.",
      });
    }

    const { date, time } = getIndiaDateTime();
    const deadline = mealDeadlines[mealType];

    if (time >= deadline) {
      return res.status(400).json({
        message: `${mealType} response deadline has passed.`,
      });
    }

    const deletedAttendance = await MealAttendance.findOneAndDelete({
      student: req.user.id,
      mealType,
      date,
    });

    if (!deletedAttendance) {
      return res.status(404).json({
        message: "No meal response found to cancel.",
      });
    }

    res.status(200).json({
      message: "Meal response cancelled. Your status is now Pending.",
    });
  } catch (error) {
    console.error("Meal cancellation error:", error.message);

    res.status(500).json({
      message: "Failed to cancel meal response.",
    });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({
        message: "Only students can view their meal attendance.",
      });
    }

    const { date } = getIndiaDateTime();

    const attendance = await MealAttendance.find({
      student: req.user.id,
      date,
    }).sort({ createdAt: -1 });

    const meals = ["Breakfast", "Lunch", "Dinner"].map((mealType) => {
      const record = attendance.find(
        (item) => item.mealType === mealType
      );

      return {
        mealType,
        status: record ? record.status : "Pending",
        attendanceId: record ? record._id : null,
      };
    });

    res.status(200).json({
      date,
      meals,
    });
  } catch (error) {
    console.error("Meal attendance fetch error:", error.message);

    res.status(500).json({
      message: "Failed to fetch meal attendance.",
    });
  }
});

module.exports = router;
