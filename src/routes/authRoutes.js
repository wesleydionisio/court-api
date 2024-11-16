const express = require('express');
const { register, login } = require('../controllers/authController');
const validateRequest = require('../middlewares/validateRequest');
const { userRegisterSchema } = require('../validations/userSchemas');

const router = express.Router();

// Rota para registro de usuários com validação
router.post('/register', validateRequest(userRegisterSchema), register);

// Rota para login (sem validação no exemplo)
router.post('/login', login);

module.exports = router;