const { pool } = require('../db');

const searchMedicine = async (req, res) => {
    try {
        const { q } = req.query;
        
        let queryStr = 'SELECT medicine_id, name, active_ingredient, dosage_form, strength, manufacturer, description FROM Medicine';
        let params = [];
        
        if (q) {
            queryStr += ' WHERE name ILIKE $1 OR active_ingredient ILIKE $1';
            params.push(`%${q}%`);
        }
        
        queryStr += ' LIMIT 20';
        
        const result = await pool.query(queryStr, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error searching medicine:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    searchMedicine
};
