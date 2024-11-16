const express = require('express');
const { createBooking } = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Endpoint para criar uma reserva
router.post('/', authMiddleware, createBooking);

module.exports = router;