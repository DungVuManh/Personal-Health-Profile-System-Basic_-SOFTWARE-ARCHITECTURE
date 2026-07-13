const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'swd',
    options: {
        encrypt: false, // Use true for azure
        trustServerCertificate: true // Change to false for production
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('\n❌ Database Connection Failed! Bad Config: ', err.message);
        console.error('👉 GỢI Ý: Chạy lệnh "node test-db.js" trong thư mục backend để tự động chẩn đoán chi tiết lỗi kết nối SQL Server.\n');
        return null; // Return null instead of throwing to prevent application crash
    });

module.exports = {
    sql,
    poolPromise
};
