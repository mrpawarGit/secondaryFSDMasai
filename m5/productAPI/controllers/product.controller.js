const Product = require("../models/productSchema");

// create product
const createProduct = async (req, res) => {
  try {
    const pro = await Product.create(req.body);
    res.status(200).json({ msg: "Product Created", pro });
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: "Error", err: error.message });
  }
};

// get all products
const getAllProducts = async (req, res) => {
  try {
    const all = await Product.find();
    res.status(200).json(all);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch Products",
      error: error.message,
    });
  }
};

// delete Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    res.status(200).json({
      message: "Product deleted successfully",
      deletedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete Product",
      error: error.message,
    });
  }
};

// update Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to Update Product",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
};
