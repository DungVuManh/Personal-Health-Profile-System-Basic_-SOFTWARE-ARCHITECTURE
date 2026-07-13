const { poolPromise } = require('../db');

const searchMedicine = async (req, res) => {
    try {
        const { q } = req.query;
        const pool = await poolPromise;
        if (!pool) {
            return res.status(503).json({ message: 'Database is offline or not configured correctly.' });
        }
        
        let queryStr = 'SELECT TOP 20 medicine_id, name, active_ingredient, dosage_form, strength, manufacturer, description FROM Medicine';
        const request = pool.request();
        
        if (q) {
            queryStr += ' WHERE name LIKE @q OR active_ingredient LIKE @q';
            request.input('q', `%${q}%`);
        }
        
        const result = await request.query(queryStr);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error searching medicine:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    searchMedicine
};
