const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
const pool = require("../models/db");

// Import routes
const adminRoutes = require("../routes/admin");
const productRoutes = require("../routes/product");
const orderRoutes = require("../routes/order");

const app = express();

app.use(cors());
app.use(express.json());

// Handle /api prefix
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

module.exports.handler = serverless(app);
