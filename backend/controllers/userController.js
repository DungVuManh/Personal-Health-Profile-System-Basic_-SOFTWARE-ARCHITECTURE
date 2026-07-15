const UserInfo = require('../models/UserInfo');
const { pool } = require('../db'); // Added missing pool import

// Operation 1: processUserRequest [Source 11, 13]
exports.processUserRequest = async (req, res) => {
    const { action, data } = req.body;

    try {
        // Bước 1: Kiểm tra quyền của Admin [Source 13]
        const hasPermission = true; // In demo, we assume permission is granted
        if (!hasPermission) {
            return res.status(403).json({ success: false, message: "Access Denied" });
        }

        // Bước 2: Xử lý theo loại hành động [Source 13]
        if (action === "ADD" || action === "EDIT") {
            if (!data.email || !data.user_id) {
                throw new Error("Missing required fields");
            }
            await UserInfo.saveData(data);
        } else if (action === "DELETE") {
            // Business Rule: Check terms before deletion [Source 11, 13]
            const isRestrictedByTerms = true; 
            if (isRestrictedByTerms) {
                await UserInfo.updateAccountStatus(data.user_id, "Deactivated");
            } else {
                // Logic for hard delete if not restricted
                await pool.query('DELETE FROM UserInfo WHERE user_id = $1', [data.user_id]); // Fixed to pool.query
            }
        }

        // Bước 3: Thông báo thành công [Source 13]
        res.status(200).json({ success: true, message: action + " successfully!" });

    } catch (error) {
        console.error("User Request Error:", error);
        res.status(500).json({ success: false, message: "Error: " + error.message });
    }
};

// GET all users for the UI list
exports.getUsers = async (req, res) => {
    try {
        const users = await UserInfo.getAll();
        res.status(200).json(users);
    } catch (error) {
        console.error("Fetch Users Error:", error);
        res.status(500).json({ message: error.message });
    }
};