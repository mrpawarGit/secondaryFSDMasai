Q: 1
Project: E-Commerce Product Order & Analytics API
You are building a backend API for an E-Commerce Product Order System using Node.js, Express, MongoDB, and Mongoose.

This system should allow managing products, users, and orders. You must use Express with MVC structure, apply middlewares, use custom modules, and perform MongoDB operations using Mongoose.

Schema Requirements

1. Product
   Each product must have:

name (required)
category (required) – only one of: electronics, clothing, home, beauty
price (required, minimum value: 1)
inStock (optional, default is true)
createdAt (auto-filled with current date) 2. User
Each user must have:

name (required)
email (required and must be unique)
address (optional)
createdAt (auto-filled with current date) 3. Order
Each order must include:

userId (reference to a user, required)
products (array of subdocuments) where each product has:
productId (reference to a product, required)
quantity (required, must be greater than 0)
totalAmount (required, must be greater than 0)
orderedAt (auto-filled with current date)
Functional Requirements
Products
POST /products → Create a new product
GET /products → Get all products
PATCH /products/:id → Update a product
DELETE /products/:id → Delete a product
Users
POST /users → Register a new user
GET /users → Get all users
Orders
POST /orders → Place a new order (calculate totalAmount based on product prices)
GET /orders → Get all orders (populate product and user details)
DELETE /orders/:id → Delete an order
Advanced Query Requirements
Create separate filtered routes using Mongoose query operators:

Get all products with price greater than or equal to 1000
Get all orders placed after 2024-01-01
Get all orders that include a product from category electronics or clothing
Get all users who have placed at least one order (use aggregation or populate with filtering)
Analytics Endpoint (Aggregation)
Create GET /analytics/top-products:

Return top 3 most ordered products (based on total quantity across all orders)
Use Mongoose aggregation with $unwind, $group, $sort, and $limit
Submission Guidelines
Push your complete project to Masai GitHub repository.
Submit the project folder link only.
