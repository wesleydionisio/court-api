const express = require('express');
const { getUser, updateUser, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Rota para buscar dados de um usuário
router.get('/:id', authMiddleware, getUser);

// Rota para atualizar dados de um usuário
router.put('/:id', authMiddleware, updateUser);

// Rota para excluir um usuário
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;