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

            // 3. Update status to "Pending Appointment" using the Entity's state management operation
            await newAppointment.updateStatus('Pending Appointment');

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
            let queryStr = 'SELECT doctor_id, name, specialty, experience_years, license_number FROM Doctor';
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

    // Check available slots for a doctor on a specific date
    static async getAvailableSlots(req, res) {
        try {
            const { doctor_id, date } = req.query;

            if (!doctor_id || !date) {
                return res.status(400).json({ message: 'doctor_id and date query parameters are required.' });
            }

            // Query slots from DoctorSchedule table
            const scheduleRes = await pool.query(
                `SELECT start_time, end_time, is_available FROM DoctorSchedule
                 WHERE doctor_id = $1 AND work_date = $2`,
                [doctor_id, date]
            );

            let slots = [];
            if (scheduleRes.rows.length > 0) {
                slots = scheduleRes.rows.map(row => ({
                    time: row.start_time,
                    is_available: row.is_available // is BOOLEAN in Postgres
                }));
            } else {
                // Fallback to standard slots if no schedule exists in DB
                // const standardSlots = [
                //     '08:00:00',
                //     '09:00:00',
                //     '10:00:00',
                //     '11:00:00',
                //     '14:00:00',
                //     '15:00:00',
                //     '16:00:00'
                // ];
                slots = standardSlots.map(s => ({
                    time: s,
                    is_available: true
                }));
            }

            // Get existing appointments for the doctor on this date to filter out already booked slots
            const result = await pool.query(
                `SELECT start_time FROM Appointment
                 WHERE doctor_id = $1 AND appointment_date = $2 AND status != 'Cancelled'`,
                [doctor_id, date]
            );

            // Extract booked start times and normalize to compare (HH:MM)
            const bookedTimes = result.rows.map(row => {
                const timeStr = row.start_time;
                return timeStr.split(':').slice(0, 2).join(':'); // e.g. "08:00"
            });

            // Map slots to check availability
            const availability = slots.map(slot => {
                const slotHHMM = slot.time.split(':').slice(0, 2).join(':');
                const isBooked = bookedTimes.includes(slotHHMM);
                return {
                    time: slot.time,
                    available: slot.is_available && !isBooked
                };
            });

            return res.json(availability);
        } catch (error) {
            console.error('Error getting available slots:', error);
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
