const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Feedback = require("../models/Feedback");
const MealAttendance = require("../models/MealAttendance");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const getIndiaDate = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = {};

  parts.forEach((part) => {
    values[part.type] = part.value;
  });

  return `${values.year}-${values.month}-${values.day}`;
};

router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const totalStudents = await User.countDocuments({
        role: "Student",
      });

      const totalFeedback = await Feedback.countDocuments();

      const ratingResult = await Feedback.aggregate([
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
          },
        },
      ]);

      const averageRating =
        ratingResult.length > 0
          ? Number(ratingResult[0].averageRating.toFixed(2))
          : 0;

      res.status(200).json({
        totalStudents,
        totalFeedback,
        averageRating,
      });
    } catch (error) {
      console.error("Stats error:", error.message);

      res.status(500).json({
        message: "Failed to fetch dashboard statistics",
      });
    }
  }
);

router.get(
  "/feedback",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const feedbacks = await Feedback.find()
        .populate("student", "name email")
        .sort({ createdAt: -1 });

      res.status(200).json({
        feedbacks,
      });
    } catch (error) {
      console.error("Feedback error:", error.message);

      res.status(500).json({
        message: "Failed to fetch all feedback",
      });
    }
  }
);

router.get(
  "/meal-attendance",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const date = getIndiaDate();

      const students = await User.find({
        role: "Student",
      }).select("name email");

      const attendanceRecords = await MealAttendance.find({
        date,
      });

      const meals = ["Breakfast", "Lunch", "Dinner"];

      const attendanceReport = meals.map((mealType) => {
        const studentList = students.map((student) => {
          const record = attendanceRecords.find(
            (item) =>
              item.student.toString() === student._id.toString() &&
              item.mealType === mealType
          );

          return {
            studentId: student._id,
            name: student.name,
            email: student.email,
            status: record ? record.status : "Pending",
          };
        });

        const willEat = studentList.filter(
          (student) => student.status === "Will Eat"
        );

        const skip = studentList.filter(
          (student) => student.status === "Skip"
        );

        const pending = studentList.filter(
          (student) => student.status === "Pending"
        );

        return {
          mealType,
          totalStudents: students.length,
          willEatCount: willEat.length,
          skipCount: skip.length,
          pendingCount: pending.length,
          willEat,
          skip,
          pending,
        };
      });

      res.status(200).json({
        date,
        attendanceReport,
      });
    } catch (error) {
      console.error("Attendance report error:", error.message);

      res.status(500).json({
        message: "Failed to fetch meal attendance report",
      });
    }
  }
);

module.exports = router;
