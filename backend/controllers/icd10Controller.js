const { pool } = require('../db');

const searchICD10 = async (req, res) => {
    try {
        const { q } = req.query;
        
        let queryStr = 'SELECT icd_code, disease_name, description FROM ICD10';
        let params = [];
        
        if (q) {
            queryStr += ' WHERE icd_code ILIKE $1 OR disease_name ILIKE $1';
            params.push(`%${q}%`);
        }
        
        queryStr += ' LIMIT 20';
        
        const result = await pool.query(queryStr, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error searching ICD10:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    searchICD10
};
