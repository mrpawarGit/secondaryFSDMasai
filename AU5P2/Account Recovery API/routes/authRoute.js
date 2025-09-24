const express = require("express");
const { register } = require("../controllers/authController");
const authRoute = express.Router();

authRoute.post("/register", register);

module.exports = authRoute;
