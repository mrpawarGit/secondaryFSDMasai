const express = require("express");
const bc = require("bcrypt");
const UserModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const saltRounds = 10;
var jwt = require("jsonwebtoken");

require("dotenv").config();

const UserRouter = express.Router();

UserRouter.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    bcrypt.hash(password, saltRounds, async function (err, hash) {
      if (err) {
        res.json({ msg: "something went wrong" });
      } else {
        await UserModel.create({ username, email, password: hash, role });
        res.json({ msg: "SignUp Success" });
      }
    });
  } catch (error) {
    res.json({ msg: "something went wrong" });
  }
});

UserRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await UserModel.findOne({ email });
    if (!user) {
      res.json({ msg: "User Not Found" });
    } else {
      let hash = user.password;
      // console.log(hash);
      bcrypt.compare(password, hash, function (err, result) {
        // result == true
        console.log(result);
        if (result) {
          // token
          var token = jwt.sign({ userID: user._id }, "shhhhh");

          res.json({ msg: "Login Success", token });
        } else {
          res.json({ msg: "Wrong Password" });
        }
      });
    }
  } catch (error) {
    res.json({ msg: "something went wrong" });
  }
});

module.exports = UserRouter;
