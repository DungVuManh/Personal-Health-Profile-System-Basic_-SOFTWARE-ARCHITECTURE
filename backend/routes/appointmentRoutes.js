const express = require('express');
const router = express.Router();
const { getAppointmentById, getAppointmentsByDoctor } = require('../controllers/appointmentController');

// GET /api/appointments?doctor_id=DOC-12345&date=2026-07-13
// Returns the doctor's worklist (Pending + In Progress) for a given date
router.get('/', getAppointmentsByDoctor);

// GET /api/appointments/:id
// Returns a single appointment with patient info
router.get('/:id', getAppointmentById);

module.exports = router;
