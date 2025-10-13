const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.get("/test", (req, res) => {
  res.json({ msg: "Test Route" });
});

app.listen(port, () => {
  console.log(`Server Started at ${port}`);
});
