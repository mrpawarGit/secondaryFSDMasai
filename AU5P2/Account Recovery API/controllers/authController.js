const UserModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const saltRounds = 10;

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    // if email id alredy exits or not
    if (user) {
      res.status(400).json({ msg: "Email ID Already Exist" });
    } else {
      // pass encryption => DB
      bcrypt.hash(password, saltRounds, async function (err, hash) {
        if (err) {
          res.status(400).json({ msg: "Something went wrong" });
        } else {
          const newUser = await UserModel.create({
            email,
            password: hash,
          });

          res
            .status(200)
            .json({ msg: "registration Successfull", welcome: email });
        }
      });
    }
  } catch (error) {
    res.status(400).json({ msg: "Error" }, error);
  }
};

const login = async (req, res) => {};

module.exports = { register, login };
