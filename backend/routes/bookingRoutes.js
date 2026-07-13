const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');

// GET /api/booking/doctors?q=name_or_specialty
router.get('/doctors', BookingController.searchDoctors);

// GET /api/booking/slots?doctor_id=DOC-12345&date=2026-07-13
router.get('/slots', BookingController.getAvailableSlots);

// GET /api/booking/patients
router.get('/patients', BookingController.getPatients);

// POST /api/booking/confirm
router.post('/confirm', BookingController.processBooking);

module.exports = router;
