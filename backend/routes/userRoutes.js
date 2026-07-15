const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers); // For the list
router.post('/manage', userController.processUserRequest); // For ADD/EDIT/DELETE

module.exports = router;