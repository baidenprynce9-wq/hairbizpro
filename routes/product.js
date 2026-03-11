const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Wrapper to handle multer errors
const uploadSingle = (fieldName) => (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
        if (err) {
            console.error('Multer upload error:', err);
            return res.status(400).json({ error: 'Image upload failed: ' + err.message });
        }
        next();
    });
};

router.get('/low-stock', authMiddleware, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const result = await pool.query(
            `SELECT * FROM products WHERE admin_id = $1 AND stock <= 20 ORDER BY stock ASC`,
            [adminId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch low stock products" });
    }
});

router.post('/', authMiddleware, uploadSingle('image'), async (req, res) => {
    try {
        console.log('--- Product POST request ---');
        console.log('Body:', req.body);
        const adminId = req.admin.id;
        const { name, cost_price, selling_price, stock } = req.body;

        // Handle image_url correctly - default to empty string if none provided
        let image_url = "";
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        } else if (req.body.image_url && req.body.image_url.trim() !== '') {
            image_url = req.body.image_url;
        }

        const parsed_cost = parseFloat(cost_price) || 0;
        const parsed_selling = parseFloat(selling_price) || 0;
        const parsed_stock = parseInt(stock) || 0;

        console.log('Final Params for INSERT:', { name, parsed_cost, parsed_selling, parsed_stock, image_url, adminId });

        await pool.query(
            `INSERT INTO products (name, cost_price, selling_price, stock, image_url, admin_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [name, parsed_cost, parsed_selling, parsed_stock, image_url, adminId]
        );
        res.json({ message: "Product added successfully" });
    } catch (err) {
        console.error('Error adding product (Detailed):', err);
        res.status(500).json({ error: "Failed to add product", details: err.message });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const result = await pool.query(
            `SELECT * FROM products WHERE admin_id = $1 ORDER BY created_at DESC`,
            [adminId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// Also expose products publicly for customers placing orders
router.get('/public/:adminId', async (req, res) => {
    try {
        const { adminId } = req.params;
        const result = await pool.query(
            `SELECT id, name, selling_price, stock, image_url FROM products WHERE admin_id = $1 AND stock > 0 ORDER BY name ASC`,
            [adminId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const productId = req.params.id;
        const result = await pool.query(
            `SELECT * FROM products WHERE id = $1 AND admin_id = $2`,
            [productId, adminId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching product:', err.message);
        res.status(500).json({ error: "Failed to fetch product" });
    }
});

router.put("/:id", authMiddleware, uploadSingle('image'), async (req, res) => {
    try {
        console.log(`--- Product PUT request for ${req.params.id} ---`);
        console.log('Body:', req.body);
        const adminId = req.admin.id;
        const productId = req.params.id;
        const { name, cost_price, selling_price, stock } = req.body;

        // Handle image_url correctly - default to empty string if none provided
        let image_url = "";
        const currentProductRes = await pool.query('SELECT image_url FROM products WHERE id = $1', [productId]);
        const existingImageUrl = currentProductRes.rows[0]?.image_url || "";

        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        } else if (req.body.image_url && req.body.image_url.trim() !== '') {
            image_url = req.body.image_url;
        } else {
            image_url = existingImageUrl;
        }

        const parsed_cost = parseFloat(cost_price) || 0;
        const parsed_selling = parseFloat(selling_price) || 0;
        const parsed_stock = parseInt(stock) || 0;

        console.log('Final Params for UPDATE:', { name, parsed_cost, parsed_selling, parsed_stock, image_url, productId, adminId });

        await pool.query(
            `UPDATE products
       SET name = $1,
           cost_price = $2,
           selling_price = $3,
           stock = $4,
           image_url = $5
       WHERE id = $6 AND admin_id = $7`,
            [name, parsed_cost, parsed_selling, parsed_stock, image_url, productId, adminId]
        );

        console.log('Database UPDATE success');
        res.json({ message: "Product updated successfully" });

    } catch (err) {
        console.error('Error updating product (Detailed):', err);
        res.status(500).json({ error: "Failed to update product", details: err.message });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const productId = req.params.id;

        await pool.query(
            "DELETE FROM products WHERE id = $1 AND admin_id = $2",
            [productId, adminId]
        );

        res.json({ message: "Product deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: "Failed to delete product" });
    }
});

module.exports = router;