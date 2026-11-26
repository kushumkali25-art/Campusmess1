const mongoose = require("mongoose");

const mealAttendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mealType: {
      type: String,
      enum: ["Breakfast", "Lunch", "Dinner"],
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Will Eat", "Skip"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

mealAttendanceSchema.index(
  { student: 1, mealType: 1, date: 1 },
  { unique: true }
);

const MealAttendance = mongoose.model(
  "MealAttendance",
  mealAttendanceSchema
);

module.exports = MealAttendance;
