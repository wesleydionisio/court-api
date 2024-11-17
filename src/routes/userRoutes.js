// src/routes/userRoutes.js

const express = require('express');
const userController = require('../controllers/userController'); // Importação completa
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// **Importante:** Defina rotas mais específicas antes das rotas com parâmetros

// Rota para obter o perfil do usuário (rota específica)
router.get('/profile', authMiddleware, userController.getUserProfile);

// Rota para buscar dados de um usuário (rota com parâmetro)
router.get('/:id', authMiddleware, userController.getUser);

// Rota para atualizar dados de um usuário
router.put('/:id', authMiddleware, userController.updateUser);

// Rota para excluir um usuário
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;