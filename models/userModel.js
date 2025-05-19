// backend/models/userModel.js

const mongoose = require("mongoose");

// פונקציית בדיקה לפורמט מספר טלפון ישראלי
function isValidIsraeliPhone(phone) {
  // מסיר רווחים, מקפים וסוגריים
  phone = phone.replace(/[-()\s]/g, "");

  // בדיקה אם מתחיל ב־05 או +9725 (לסלולרי), או 0X / +972X (לנייחים)
  const regex = /^(?:\+972|0)([2-9]\d{7}|5\d{8})$/;
  return regex.test(phone);
}

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "מספר טלפון הוא שדה חובה"],
      validate: {
        validator: isValidIsraeliPhone,
        message: "מספר הטלפון אינו חוקי. ודא שמדובר במספר ישראלי תקין.",
      },
      unique: true, // כדי למנוע כפילויות במספרי טלפון
    },
    userType: {
      type: String,
      enum: ["customer", "admin", "deleveryguy"],
      default: "customer",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
