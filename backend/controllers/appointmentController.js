const { pool } = require('../db');

const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
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
            WHERE a.appointment_id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const getAppointmentsByDoctor = async (req, res) => {
    try {
        const { doctor_id, date } = req.query;

        if (!doctor_id) {
            return res.status(400).json({ message: 'doctor_id query parameter is required.' });
        }

        const targetDate = date || null;

        const result = await pool.query(`
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
            WHERE a.doctor_id = $1
              AND a.appointment_date = COALESCE($2, CURRENT_DATE)
              AND a.status IN ('Pending', 'In Progress')
            ORDER BY a.start_time ASC
        `, [doctor_id, targetDate]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching appointments by doctor:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    getAppointmentById,
    getAppointmentsByDoctor,
};
