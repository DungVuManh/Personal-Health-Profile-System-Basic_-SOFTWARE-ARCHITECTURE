const { poolPromise } = require('../db');

const searchICD10 = async (req, res) => {
    try {
        const { q } = req.query;
        const pool = await poolPromise;
        if (!pool) {
            return res.status(503).json({ message: 'Database is offline or not configured correctly.' });
        }
        
        let queryStr = 'SELECT TOP 20 icd_code, disease_name, description FROM ICD10';
        const request = pool.request();
        
        if (q) {
            queryStr += ' WHERE icd_code LIKE @q OR disease_name LIKE @q';
            request.input('q', `%${q}%`);
        }
        
        const result = await request.query(queryStr);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error searching ICD10:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    searchICD10
};
