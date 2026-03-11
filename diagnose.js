const pool = require('./models/db');
const fs = require('fs');
const path = require('path');

async function diagnose() {
    console.log('--- START DIAGNOSIS ---');

    // 1. Check Database Schema
    try {
        const schemaRes = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'products'
            ORDER BY ordinal_position;
        `);
        console.log('Products Schema:');
        console.log(JSON.stringify(schemaRes.rows, null, 2));
    } catch (err) {
        console.error('Error fetching schema:', err.message);
    }

    // 2. Check Uploads Directory
    const uploadDir = path.join(__dirname, 'uploads');
    console.log('Uploads Directory:', uploadDir);
    try {
        if (!fs.existsSync(uploadDir)) {
            console.log('Uploads directory does NOT exist. Creating it...');
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        console.log('Uploads directory exists.');
        const files = fs.readdirSync(uploadDir);
        console.log(`Found ${files.length} files in uploads.`);
    } catch (err) {
        console.error('Error checking uploads dir:', err.message);
    }

    // 3. Check for log file
    const logFile = path.join(__dirname, 'server_error.log');
    if (fs.existsSync(logFile)) {
        console.log('server_error.log found. Content:');
        console.log(fs.readFileSync(logFile, 'utf8'));
    } else {
        console.log('server_error.log NOT found.');
    }

    // 4. Test a mock query
    try {
        const testRes = await pool.query('SELECT 1 as test');
        console.log('Database connection test:', testRes.rows[0]);
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }

    console.log('--- END DIAGNOSIS ---');
    process.exit(0);
}

diagnose();
