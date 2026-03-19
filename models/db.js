require("dotenv").config();
const { Pool } = require("pg");

let pool;

if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
} else if (process.env.DB_USER) {
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });
} else {
    console.warn("WARNING: No Database credentials found. API will fail until DATABASE_URL is set.");
    // Mock pool to prevent total crash on import
    pool = {
        query: () => { throw new Error("Database not connected. Please set DATABASE_URL in Netlify settings."); },
        connect: () => { throw new Error("Database not connected."); }
    };
}

module.exports = pool;