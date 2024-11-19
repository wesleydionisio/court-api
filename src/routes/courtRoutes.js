// src/routes/courtRoutes.js

const express = require('express');
const router = express.Router();
const courtController = require('../controllers/courtController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas
router.get('/', courtController.getCourts);
router.get('/:id', courtController.getCourtById);
router.get('/:id/reserved-times', courtController.getReservedTimes);

// Rotas protegidas
router.post('/', authMiddleware, courtController.createCourt);
router.put('/:id', authMiddleware, courtController.updateCourt);
router.delete('/:id', authMiddleware, courtController.deleteCourt);

module.exports = router;