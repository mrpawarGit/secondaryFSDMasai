const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected");
  } catch (error) {
    console.log("Error while connecting DB");
  }
};

module.exports = connectDB;
