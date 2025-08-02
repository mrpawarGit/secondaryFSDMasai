const Product = require("../models/productSchema");

const createProduct = async (req, res) => {
  try {
    const pro = await Product.create(req.body);
    res.status(200).json({ msg: "Product Created", pro });
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: "Error", err: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const all = await Feedback.find();
    res.status(200).json(all);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch Products",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
};
