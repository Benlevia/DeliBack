// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const serverless = require("serverless-http");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const MONGOURI = process.env.MONGO_URI;

const app = express();

app.use(express.json());
app.use(cors());

app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to DeliZariz Backend!");
});

// ✅ התחברות למונגו רק אם עדיין לא מחוברים
let isConnected = false;

async function connectToDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGOURI);
    isConnected = true;
    console.log("✅ Connected to MongoDB (once)");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

connectToDB(); // קריאה ראשונית

module.exports = serverless(app);
