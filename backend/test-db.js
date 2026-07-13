const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'swd',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 5000 // 5 seconds timeout
    }
};

console.log('====================================================');
console.log('CÔNG CỤ CHẨN ĐOÁN KẾT NỐI SQL SERVER (NHÓM 6)');
console.log('====================================================');
console.log(`Đang kết nối bằng cấu hình:`);
console.log(`- Server  : ${config.server}`);
console.log(`- Database: ${config.database}`);
console.log(`- User    : ${config.user}`);
console.log(`- Password: ${'*'.repeat(config.password.length)}`);
console.log('----------------------------------------------------');

async function runDiagnostics() {
    try {
        const pool = await sql.connect(config);
        console.log('🎉 KẾT NỐI ĐẾN SQL SERVER THÀNH CÔNG!\n');
        
        console.log('Kiểm tra dữ liệu các bảng:');
        const tables = [
            'Patient', 'Doctor', 'Appointment', 'ICD10', 
            'Medicine', 'HealthRecord', 'Prescription', 'PrescriptionDetail'
        ];
        
        for (const table of tables) {
            try {
                const result = await pool.request().query(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`- Bảng [${table}]: ${result.recordset[0].count} bản ghi.`);
            } catch (err) {
                console.log(`- Bảng [${table}]: ❌ Không truy cập được (Có thể bảng chưa được tạo hoặc sai tên). Chi tiết: ${err.message}`);
            }
        }
        
        console.log('\n✅ Database swd đã sẵn sàng cho Frontend kết nối!');
        await pool.close();
    } catch (err) {
        console.log('❌ KẾT NỐI THẤT BẠI!');
        console.log(`Lỗi chi tiết: ${err.message}`);
        console.log('\n====================================================');
        console.log('HƯỚNG DẪN KHẮC PHỤC LỖI KẾT NỐI (TROUBLESHOOTING):');
        console.log('====================================================');
        
        if (err.message.includes('ESOCKET') || err.message.includes('Connection lost') || err.message.includes('ETIMEOUT')) {
            console.log('1. Kiểm tra dịch vụ SQL Server:');
            console.log('   - Mở CMD/PowerShell quyền Admin và chạy: net start mssqlserver (hoặc net start mssqlexpress)');
            console.log('   - Hoặc gõ "Services.msc" kiểm tra dịch vụ "SQL Server (MSSQLSERVER)" hoặc "SQL Server (SQLEXPRESS)" đã ở trạng thái Running chưa.\n');
            console.log('2. Bật cổng mạng TCP/IP cho SQL Server:');
            console.log('   - Mở "SQL Server Configuration Manager".');
            console.log('   - Vào "SQL Server Network Configuration" -> "Protocols for MSSQLSERVER" (hoặc Protocols for SQLEXPRESS).');
            console.log('   - Bấm đúp vào "TCP/IP" -> Chọn Enabled = Yes.');
            console.log('   - Sang Tab "IP Addresses" -> Kéo xuống dưới cùng mục "IPAll" -> Thiết lập "TCP Port" là 1433.');
            console.log('   - KHỞI ĐỘNG LẠI dịch vụ SQL Server để cấu hình có hiệu lực.\n');
        }
        
        if (err.message.includes('login failed') || err.message.includes('Login failed')) {
            console.log('1. Kiểm tra tài khoản / mật khẩu trong file backend/.env:');
            console.log(`   - DB_USER hiện tại: "${config.user}"`);
            console.log(`   - DB_PASSWORD hiện tại: "${config.password}"`);
            console.log('   - Hãy đảm bảo tài khoản này đăng nhập được bình thường qua SQL Server Management Studio (SSMS).\n');
            console.log('2. Kiểm tra chế độ xác thực (Authentication Mode) của SQL Server:');
            console.log('   - Mở SSMS -> Chuột phải vào Server -> chọn Properties -> Chọn tab Security.');
            console.log('   - Đảm bảo đã chọn "SQL Server and Windows Authentication mode" (Mixed Mode). Nếu đổi, hãy restart dịch vụ SQL Server.');
            console.log('   - Đảm bảo tài khoản "sa" không bị disabled (SSMS -> Security -> Logins -> sa -> Properties -> Status -> Login: Enabled).\n');
        }
        
        if (err.message.includes('database') || err.message.includes('Database')) {
            console.log('1. Kiểm tra xem database đã được tạo chưa:');
            console.log(`   - Đảm bảo bạn đã chạy file script "database.sql" để tạo database tên "${config.database}" và các bảng.`);
            console.log('   - Bạn có thể chạy script trong SSMS hoặc công cụ SQL khác.\n');
        }
        
        console.log('Tham khảo tài liệu đầy đủ trong thư mục dự án.');
    }
}

runDiagnostics();
