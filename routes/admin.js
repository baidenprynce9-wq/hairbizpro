const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', async (req, res) => {
    try {
        const { business_name, phone, email, password } = req.body;

        const existingAdmin = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
        if (existingAdmin.rows.length > 0) {
            return res.status(400).json({ message: 'Admin with the same email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const result = await pool.query(
            `INSERT INTO admins (business_name, phone, email, password) VALUES ($1, $2, $3, $4) RETURNING id, business_name, email`,
            [business_name, phone, email, hashedPassword]
        );

        res.status(201).json({ message: 'Admin registered successfully', admin: result.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);

        if (admin.rows.length === 0) {
            return res.status(400).json({ message: 'Admin not found' });
        }

        const validPassword = await bcrypt.compare(password, admin.rows[0].password);

        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            {
                id: admin.rows[0].id,
                business_name: admin.rows[0].business_name
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            admin: {
                id: admin.rows[0].id,
                business_name: admin.rows[0].business_name,
                email: admin.rows[0].email,
                phone: admin.rows[0].phone
            }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get admin profile (used for share link generation)
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const result = await pool.query(
            'SELECT id, business_name, phone, email FROM admins WHERE id = $1',
            [adminId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Public endpoint — get business name by adminId (for customer order form header)
router.get('/business/:adminId', async (req, res) => {
    try {
        const { adminId } = req.params;
        const result = await pool.query(
            'SELECT id, business_name FROM admins WHERE id = $1',
            [adminId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Business not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to fetch business info' });
    }
});

module.exports = router;