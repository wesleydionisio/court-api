const express = require('express');
const {
  getCourts,
  getCourtById,
  createCourt,
  updateCourt,
  deleteCourt,
} = require('../controllers/courtController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Rota para listar todas as quadras
router.get('/', getCourts);

// Rota para buscar uma quadra específica
router.get('/:id', getCourtById);

// Rota para criar uma nova quadra (autenticado)
router.post('/', authMiddleware, createCourt);

// Rota para atualizar uma quadra (autenticado)
router.put('/:id', authMiddleware, updateCourt);

// Rota para excluir uma quadra (autenticado)
router.delete('/:id', authMiddleware, deleteCourt);

module.exports = router;