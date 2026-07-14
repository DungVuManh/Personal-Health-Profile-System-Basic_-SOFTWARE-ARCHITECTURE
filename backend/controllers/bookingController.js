const Appointment = require('../models/Appointment');
const { pool } = require('../db');

class BookingController {
    // Operation derived from Communication Diagram analysis
    static async processBooking(req, res) {
        try {
            const { patientId, doctorId, slotDate, slotTime, serviceType } = req.body;

            if (!patientId || !doctorId || !slotDate || !slotTime) {
                return res.status(400).json({ message: 'Patient ID, Doctor ID, Date, and Time slot are required.' });
            }

            // Create a Details object representing the booking data
            const details = {
                patientId,
                doctorId,
                appointment_date: slotDate,
                start_time: slotTime,
                serviceType: serviceType || 'General Consultation'
            };

            // 1. Instantiate the Appointment Entity object
            const newAppointment = new Appointment({
                patient_id: details.patientId,
                doctor_id: details.doctorId,
                appointment_date: details.appointment_date,
                start_time: details.start_time,
                status: 'Pending' // Initial status
            });

            // 2. Save the appointment (reserve)
            await newAppointment.save();

            // 3. Update status to "Pending" using the Entity's state management operation
            await newAppointment.updateStatus('Pending');

            // 4. Return successful message back to boundary UI
            return res.status(201).json({
                message: 'successfully booking',
                appointment: {
                    appointment_id: newAppointment.appointment_id,
                    patient_id: newAppointment.patient_id,
                    doctor_id: newAppointment.doctor_id,
                    appointment_date: newAppointment.appointment_date,
                    start_time: newAppointment.start_time,
                    status: newAppointment.status,
                    service_type: details.serviceType
                }
            });

        } catch (error) {
            console.error('Error in processBooking coordinator:', error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    // Search doctors by name or specialty
    static async searchDoctors(req, res) {
        try {
            const { q } = req.query;
            let queryStr = 'SELECT doctor_id, name, specialty, experience_years, license_number, working_time FROM Doctor';
            let params = [];

            if (q) {
                queryStr += ' WHERE name ILIKE $1 OR specialty ILIKE $1';
                params.push(`%${q}%`);
            }

            const result = await pool.query(queryStr, params);
            return res.json(result.rows);
        } catch (error) {
            console.error('Error searching doctors:', error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    // Get doctor's working session (Morning or Afternoon) based on working_time field
    // Returns: { working_time, session, start_time, available }
    static async getAvailableSlots(req, res) {
        try {
            const { doctor_id, date } = req.query;

            if (!doctor_id || !date) {
                return res.status(400).json({ message: 'doctor_id and date query parameters are required.' });
            }

            // Get doctor's working_time: 1 = Morning, 2 = Afternoon
            const doctorRes = await pool.query(
                'SELECT working_time FROM Doctor WHERE doctor_id = $1',
                [doctor_id]
            );

            if (doctorRes.rows.length === 0) {
                return res.status(404).json({ message: 'Doctor not found.' });
            }

            const workingTime = doctorRes.rows[0].working_time;

            // Determine session label and representative start_time
            const sessionName = workingTime === 1 ? 'Morning' : 'Afternoon';
            const startTime = workingTime === 1 ? '08:00:00' : '13:00:00';

            // Check if doctor already has a booking in this session on the chosen date
            // (multiple bookings per session allowed — set available: true always)
            return res.json({
                working_time: workingTime,
                session: sessionName,
                start_time: startTime,
                available: true
            });

        } catch (error) {
            console.error('Error getting session info:', error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    // Get patients list to choose from in front-end
    static async getPatients(req, res) {
        try {
            const result = await pool.query('SELECT patient_id, name, dob, phone, email, address FROM Patient ORDER BY name ASC');
            return res.json(result.rows);
        } catch (error) {
            console.error('Error getting patients:', error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
}

module.exports = BookingController;
