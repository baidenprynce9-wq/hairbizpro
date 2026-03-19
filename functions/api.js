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

// Routes must include the /api prefix because that's what's passed by the redirect
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Fallback for paths without /api just in case
app.use("/admin", adminRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

module.exports.handler = serverless(app);
