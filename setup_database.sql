-- HairBiz Pro Database Schema

-- Clear existing tables (Optional)
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS products;
-- DROP TABLE IF EXISTS admins;

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    business_name TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cost_price DECIMAL(12, 2) DEFAULT 0.00,
    selling_price DECIMAL(12, 2) DEFAULT 0.00,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(12, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'pending', -- pending, processing, delivered, cancelled
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_products_admin ON products(admin_id);
CREATE INDEX IF NOT EXISTS idx_orders_admin ON orders(admin_id);
