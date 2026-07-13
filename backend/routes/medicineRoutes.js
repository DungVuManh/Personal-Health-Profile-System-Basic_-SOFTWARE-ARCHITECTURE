const express = require('express');
const router = express.Router();
const { searchMedicine } = require('../controllers/medicineController');

router.get('/', searchMedicine);

module.exports = router;
