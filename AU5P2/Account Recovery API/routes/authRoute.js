const express = require("express");
const { register, login, resetPass } = require("../controllers/authController");
const authRoute = express.Router();

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.post("/reset-password/:token", resetPass);

module.exports = authRoute;
