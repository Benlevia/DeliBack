// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const MONGOURI = process.env.MONGO_URI;
const app = express();

app.use(express.json());

// ✅ CORS configuration with multiple origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://deli-front.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Routes
app.get("/", (req, res) => {
  res.send("Welcome to DeliZariz Backend!");
});

app.set("trust proxy", 1); // Trust first proxy for things like secure cookies
app.use("/users", userRoutes);

// ✅ MongoDB connection
console.log("MONGOURI:", MONGOURI);

mongoose
  .connect(MONGOURI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
