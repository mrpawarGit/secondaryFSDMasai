const express = require("express");
const connectDB = require("./db");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ msg: "App is Running" });
});

app.listen(3000, async () => {
  await connectDB();
  console.log("Server Started at http://localhost:3000/");
});
