const mongoose = require("mongoose");
require("dotenv");

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URl);
    // await mongoose.connect("mongodb://127.0.0.1:27017/devDB");
    console.log("DB Connected");
  } catch (error) {
    console.log("Error while connecting DB");
    // console.log(error.message);
  }
};

module.exports = connectToDB;
