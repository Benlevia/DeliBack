// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const MONGOURI = process.env.MONGO_URI;

const app = express();

// ✅ שימוש במידלוורים לפני הראוטים
app.use(express.json()); // מאפשר לשרת לקרוא JSON בבקשות POST
app.use(cors()); // מאפשר גישה מ-Frontend

// ✅ ראוטים

app.use("/users", userRoutes);

// ✅ בדיקת קונסולה
console.log("MONGOURI:", MONGOURI);

// ✅ חיבור למסד הנתונים
mongoose
  .connect(MONGOURI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ ראוט בדיקה
app.get("/", (req, res) => {
  res.send("Welcome to DeliZariz Backend!");
});

// ✅ הרצת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
