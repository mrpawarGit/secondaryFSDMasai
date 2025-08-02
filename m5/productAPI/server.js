const express = require("express");
const connectDB = require("./db");

const app = express();
app.use(express.json());

app.listen(3000, async () => {
  await connectDB();
  console.log("Server Started at http://localhost:3000/");
});
