const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const authMiddleware = require("../middleware/authMiddleware");
const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'order-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post("/place-order", upload.single('image'), async (req, res) => {
    try {
        const {
            admin_id,
            customer_name,
            customer_phone,
            product_id,
            quantity
        } = req.body;

        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        const productResult = await pool.query(
            "SELECT selling_price, stock FROM products WHERE id = $1 AND admin_id = $2",
            [product_id, admin_id]
        );

        if (productResult.rows.length === 0) {
            return res.status(400).json({ error: "Product not found" });
        }

        const product = productResult.rows[0];

        if (product.stock < quantity) {
            return res.status(400).json({ error: "Not enough stock available" });
        }

        const total_price = product.selling_price * quantity;

        await pool.query(
            "UPDATE products SET stock = stock - $1 WHERE id = $2",
            [quantity, product_id]
        );

        await pool.query(
            `INSERT INTO orders 
       (admin_id, customer_name, customer_phone, product_id, quantity, total_price, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [admin_id, customer_name, customer_phone, product_id, quantity, total_price, image_url]
        );

        res.json({ message: "Order placed successfully" });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Order failed" });
    }
});

router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const orders = await pool.query(
            `SELECT orders.*, products.name AS product_name
       FROM orders
       LEFT JOIN products ON orders.product_id = products.id
       WHERE orders.admin_id = $1
       ORDER BY orders.created_at DESC`,
            [adminId]
        );
        res.json(orders.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: `Failed to fetch orders` });
    }
});

router.put("/update-status/:id", authMiddleware, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const orderId = req.params.id;
        const { status } = req.body;

        const orderResult = await pool.query(
            "SELECT * FROM orders WHERE id = $1 AND admin_id = $2",
            [orderId, adminId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        const order = orderResult.rows[0];

        if (status === "cancelled" && order.status !== "cancelled") {
            await pool.query(
                "UPDATE products SET stock = stock + $1 WHERE id = $2",
                [order.quantity, order.product_id]
            );
        }

        await pool.query(
            "UPDATE orders SET status = $1 WHERE id = $2",
            [status, orderId]
        );

        res.json({ message: "Order status updated" });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update order" });
    }
});

router.get('/revenue-summary', authMiddleware, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const result = await pool.query(
            `SELECT COUNT(*) AS total_orders, SUM(total_price) AS total_revenue 
             FROM orders WHERE admin_id = $1 AND status = 'delivered'`,
            [adminId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch revenue summary' });
    }
});

router.get("/daily-revenue", authMiddleware, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const result = await pool.query(
            `SELECT 
         DATE(created_at) AS date,
         SUM(total_price) AS revenue
       FROM orders
       WHERE admin_id = $1 AND status = 'delivered'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
            [adminId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch daily revenue" });
    }
});

router.get("/monthly-revenue", authMiddleware, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const result = await pool.query(
            `SELECT 
         DATE_TRUNC('month', created_at) AS month,
         SUM(total_price) AS revenue
       FROM orders
       WHERE admin_id = $1 AND status = 'delivered'
       GROUP BY month
       ORDER BY month DESC`,
            [adminId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch monthly revenue" });
    }
});

module.exports = router;