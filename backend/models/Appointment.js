const { pool } = require('../db');

class Appointment {
    constructor(data = {}) {
        this.appointment_id = data.appointment_id || null;
        this.patient_id = data.patient_id || null;
        this.doctor_id = data.doctor_id || null;
        this.appointment_date = data.appointment_date || null;
        this.start_time = data.start_time || null;
        this.status = data.status || 'Pending';
    }

    // Generate unique ID: APP-XXXXX
    static generateId() {
        const randNum = Math.floor(10000 + Math.random() * 90000);
        return `APP-${randNum}`;
    }

    // Save appointment to DB
    async save() {
        if (!this.appointment_id) {
            this.appointment_id = Appointment.generateId();
        }

        await pool.query(
            `INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [this.appointment_id, this.patient_id, this.doctor_id, this.appointment_date, this.start_time, this.status]
        );
        return this;
    }

    // CRUD Entity Class Operation
    async updateStatus(newStatus) {
        if (this.isValidStatus(newStatus)) {
            this.status = newStatus;
            await pool.query(
                `UPDATE Appointment SET status = $1 WHERE appointment_id = $2`,
                [newStatus, this.appointment_id]
            );
        } else {
            throw new Error(`Invalid status transition to: ${newStatus}`);
        }
    }

    isValidStatus(status) {
        // Allow Pending, Pending Appointment (specified by user), In Progress, Completed, Cancelled
        const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
        return validStatuses.includes(status);
    }
}

module.exports = Appointment;
