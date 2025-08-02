const express = require("express");
const connectDB = require("./db");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());

app.use("/products", productRoutes);
app.use("/products", userRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ msg: "App is Running" });
});

app.listen(3000, async () => {
  await connectDB();
  console.log("Server Started at http://localhost:3000/");
});
