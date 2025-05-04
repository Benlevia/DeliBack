// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const serverless = require("serverless-http");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

// ✅ הוספת Middleware ידני ל-CORS עם הגדרות נכונות
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // או שים את הדומיין שלך במקום "*"
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to DeliZariz Backend!");
});

// ✅ התחברות למונגו
let isConnected = false;

async function connectToDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("✅ Connected to MongoDB (once)");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

connectToDB();

module.exports = serverless(app);
