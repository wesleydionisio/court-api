// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();

// Importar o middleware de validação
const validateRequest = require('../middlewares/validateRequest');

// Importar os esquemas de validação
const { userRegisterSchema, userLoginSchema } = require('../schemas/userSchemas');

// Importar os controladores de autenticação
const { register, login } = require('../controllers/authController');

// Rota para registro de usuários com validação
router.post('/register', validateRequest(userRegisterSchema), register);

// Rota para login com validação
router.post('/login', validateRequest(userLoginSchema), login);

module.exports = router;