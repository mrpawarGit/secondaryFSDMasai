const express = require("express");
require("dotenv").config();
const connectToDB = require("./config/db");
const UserRouter = require("./routes/user.route");

const PORT = process.env.PORT || 3000;
const app = express();

// db connect
connectToDB();
// parser
app.use(express.json());

// user router
app.use("/api/auth", UserRouter);

// default handle
app.use((req, res) => {
  res.json({ msg: "Not Found" });
});

// server
app.listen(PORT, () => {
  console.log("Server Started");
});
