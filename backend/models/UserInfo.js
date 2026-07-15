const { pool } = require('../db');

class UserInfo {
    // Operation 2: updateAccountStatus [From PDF Detail Design]
    static async updateAccountStatus(userId, newStatus) {
        const validStatuses = ["Active", "Locked", "Deactivated"];
        if (!validStatuses.includes(newStatus)) {
            throw new Error("Invalid status transition");
        }
        const query = 'UPDATE UserInfo SET management_status = $1 WHERE user_id = $2';
        return await pool.query(query, [newStatus, userId]);
    }

    // Interaction 6: saveUserData() [From Communication Diagram]
    static async saveData(data) {
        const query = `
            INSERT INTO UserInfo (user_id, username, email, phone, address, permission_id, management_status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                username = $2,
                email = $3, 
                phone = $4, 
                address = $5, 
                permission_id = $6, 
                management_status = $7
        `;
        return await pool.query(query, [
            data.user_id, 
            data.username,
            data.email, 
            data.phone, 
            data.address, 
            data.permission_id, 
            data.management_status || 'Active'
        ]);
    }

    static async getAll() {
        const res = await pool.query('SELECT * FROM UserInfo ORDER BY user_id ASC');
        return res.rows;
    }
}

module.exports = UserInfo;