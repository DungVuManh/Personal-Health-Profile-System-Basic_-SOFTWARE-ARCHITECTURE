const { poolPromise } = require('../db');

/**
 * GET /api/appointments/:id
 * Fetch a single appointment by its ID, joining with Patient info.
 */
const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        if (!pool) {
            return res.status(503).json({ message: 'Database is offline or not configured correctly.' });
        }
        
        const result = await pool.request()
            .input('appointment_id', id)
            .query(`
                SELECT 
                    a.appointment_id, 
                    a.patient_id, 
                    a.doctor_id, 
                    a.appointment_date, 
                    a.start_time, 
                    a.status,
                    p.name AS patient_name,
                    p.dob AS patient_dob,
                    p.phone AS patient_phone,
                    p.email AS patient_email,
                    p.address AS patient_address
                FROM Appointment a
                INNER JOIN Patient p ON a.patient_id = p.patient_id
                WHERE a.appointment_id = @appointment_id
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * GET /api/appointments
 * Fetch all appointments for a doctor on a given date (defaults to today).
 * Only returns appointments with status 'Pending' or 'In Progress'.
 * Query params: doctor_id (required), date (optional, format YYYY-MM-DD)
 */
const getAppointmentsByDoctor = async (req, res) => {
    try {
        const { doctor_id, date } = req.query;

        if (!doctor_id) {
            return res.status(400).json({ message: 'doctor_id query parameter is required.' });
        }

        const pool = await poolPromise;
        if (!pool) {
            return res.status(503).json({ message: 'Database is offline or not configured correctly.' });
        }

        // Use provided date or default to today (SQL Server CAST to DATE)
        const targetDate = date || null;

        const result = await pool.request()
            .input('doctor_id', doctor_id)
            .input('target_date', targetDate)
            .query(`
                SELECT
                    a.appointment_id,
                    a.patient_id,
                    a.doctor_id,
                    a.appointment_date,
                    a.start_time,
                    a.status,
                    p.name AS patient_name,
                    p.dob AS patient_dob,
                    p.phone AS patient_phone,
                    p.email AS patient_email,
                    p.address AS patient_address
                FROM Appointment a
                INNER JOIN Patient p ON a.patient_id = p.patient_id
                WHERE a.doctor_id = @doctor_id
                  AND a.appointment_date = ISNULL(@target_date, CAST(GETDATE() AS DATE))
                  AND a.status IN ('Pending', 'In Progress')
                ORDER BY a.start_time ASC
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching appointments by doctor:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    getAppointmentById,
    getAppointmentsByDoctor,
};
