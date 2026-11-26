const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");
const mealAttendanceRoutes = require("./routes/mealAttendanceRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/feedback", feedbackRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/meal-attendance", mealAttendanceRoutes);

app.get("/", (req, res) => {
  res.send("CampusMess Backend is Running!");
});

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});