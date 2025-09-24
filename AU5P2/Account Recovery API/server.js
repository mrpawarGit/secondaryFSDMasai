const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// db connect
connectDB();

// parser
app.use(express.json());

// test route
app.get("/test", (req, res) => {
  res.status(200).json({ msg: "Test Route" });
});

// invalid route handle
app.use((req, res) => {
  res.status(400).json({ msg: "Not Found" });
});

app.listen(PORT, () => {
  console.log("Server Started at Port", PORT);
});
