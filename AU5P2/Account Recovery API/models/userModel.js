const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: { type: String, required: true },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
