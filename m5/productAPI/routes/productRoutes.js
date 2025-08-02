const express = require("express");
const {
  createProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
} = require("../controllers/product.controller");

const router = express.Router();

router.get("/", getAllProducts);
router.post("/", createProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id", updateProduct);

module.exports = router;
