const express = require('express');
const router = express.Router();
const { createHealthRecord } = require('../controllers/healthRecordController');

router.post('/', createHealthRecord);

module.exports = router;
