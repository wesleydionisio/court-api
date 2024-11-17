// src/routes/bookingRoutes.js
const express = require('express');
const { createBooking, cancelBooking, getReservedTimes, getBookingById } = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Endpoint para criar uma reserva
router.post('/', authMiddleware, createBooking);

// Endpoint para cancelar uma reserva
router.put('/:id/cancel', authMiddleware, cancelBooking);

// Endpoint para consultar horários agendados
router.get('/:quadraId/reserved-times', getReservedTimes);

// Endpoint para buscar detalhes de uma reserva por ID
router.get('/:id', authMiddleware, getBookingById); // Protegido por autenticação


module.exports = router;