const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
    host: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'swd',
    port: process.env.DB_PORT || 5432,
});

pool.on('error', (err, client) => {
    console.error('\n❌ Database Connection Failed! Bad Config: ', err.message);
});

pool.connect()
    .then(client => {
        console.log('Connected to PostgreSQL');
        client.release();
    })
    .catch(err => {
        console.error('Error connecting to PostgreSQL:', err.message);
    });

module.exports = {
    pool
};
