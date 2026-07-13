const express = require('express');
const router = express.Router();
const { searchICD10 } = require('../controllers/icd10Controller');

router.get('/', searchICD10);

module.exports = router;
