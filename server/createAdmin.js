const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash("Admin@12345", 10);

    const existingAdmin = await User.findOne({
      role: "Admin",
    });

    if (existingAdmin) {
      existingAdmin.password = hashedPassword;

      await existingAdmin.save();

      console.log("Admin password reset successfully!");
      console.log("Email:", existingAdmin.email);
    } else {
      const admin = await User.create({
        name: "CampusMess Admin",
        email: "admin@campusmess.com",
        password: hashedPassword,
        role: "Admin",
      });

      console.log("Admin created successfully!");
      console.log("Email:", admin.email);
    }
  } catch (error) {
    console.log("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
