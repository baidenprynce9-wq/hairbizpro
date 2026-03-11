const pool = require('./models/db');

async function checkSchema() {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'products'
            ORDER BY ordinal_position;
        `);
        console.log('--- PRODUCTS SCHEMA ---');
        console.log(JSON.stringify(result.rows, null, 2));

        const countRes = await pool.query('SELECT COUNT(*) FROM products;');
        console.log('--- PRODUCT COUNT ---');
        console.log(countRes.rows[0]);

        const sampleRes = await pool.query('SELECT * FROM products LIMIT 1;');
        console.log('--- SAMPLE PRODUCT ---');
        console.log(JSON.stringify(sampleRes.rows[0], null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Error checking schema:', err);
        process.exit(1);
    }
}

checkSchema();
