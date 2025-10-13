const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.get("/test", (req, res) => {
  res.json({ msg: "Test Route" });
});

app.listen(port, () => {
  console.log(`Server Started at ${port}`);
});
