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

// Routes are now relative to the function root
// Redirects will convert /api/admin/* -> /.netlify/functions/api/admin/*
app.use("/admin", adminRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

module.exports.handler = serverless(app);
