// backend/routes/userRoutes.js

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const User = require("../models/userModel");
const authMiddleware = require("../middleware/authMiddleware");
dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// 🟢 רישום משתמש חדש
router.post("/register", async (req, res) => {
  try {
    const { username, password, email, userType } = req.body;

    // בדיקה אם כל השדות קיימים
    if (!username || !password || !email) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // בדיקה אם המשתמש כבר קיים לפי שם משתמש או אימייל
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      userType: userType || "customer", // ברירת מחדל
    });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        username: newUser.username,
        userType: newUser.userType,
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(201).json({
      message: "User created",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        userType: newUser.userType,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 התחברות משתמש קיים
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username and password" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, username: user.username, userType: user.userType },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟡 מחיקת משתמש מחובר
router.delete("/delete", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: `User ${deletedUser.username} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟡 עדכון משתמש מחובר
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, password } = req.body;

    const updateData = {};
    if (username) updateData.username = username;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 קבלת כל המשתמשים (לבדיקה)
router.get("/getUsers", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
