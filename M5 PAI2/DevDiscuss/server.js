const express = require("express");
const dotenv = require("dotenv");

const PORT = process.env.PORT || 3000;
const app = express();

// parser
app.use(express.json());

// default handle
app.use((req, res) => {
  res.json({ msg: "Not Found" });
});

// server
app.listen(PORT, () => {
  console.log("Server Started");
});
