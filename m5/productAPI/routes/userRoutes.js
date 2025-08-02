const express = require("express");
const {
  createProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
} = require("../controllers/product.controller");
const { createUser, getAllUsers } = require("../controllers/user.controller");

const router = express.Router();

router.get("/", createUser);
router.post("/", getAllUsers);

module.exports = router;
