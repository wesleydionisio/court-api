// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
      req.user = await User.findById(decoded.id).select('-senha'); // Excluir a senha
      if (!req.user) {
        return res.status(401).json({ message: 'Usuário não encontrado.' });
      }
      next();
    } catch (err) {
      console.error('Token inválido:', err);
      res.status(401).json({ message: 'Token inválido. Acesso negado.' });
    }
  } else {
    res.status(401).json({ message: 'Autenticação necessária.' });
  }
};

module.exports = authMiddleware;