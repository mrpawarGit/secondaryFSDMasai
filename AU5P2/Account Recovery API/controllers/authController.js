const UserModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const saltRounds = 10;

// signup
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if email & passwod is present
    if (!email || !password) {
      return res.status(400).json({ msg: "Email or Password is missing" });
    }

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
          // hased pass will be saved
          await UserModel.create({
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

// login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    console.log(user);
    if (!user) {
      res.status(400).json({ msg: "User Not Found" });
    } else {
      let hash = user.password;

      // password check
      bcrypt.compare(password, hash, function (err, result) {
        if (result) {
          var token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
          res.status(200).json({ msg: "Login Sucess", token });
        } else {
          res.status(400).json({ msg: "Invalid Password" });
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "Something went wrong", error });
  }
};

module.exports = { register, login };
