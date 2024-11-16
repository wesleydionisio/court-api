const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { nome, email, telefone, senha } = req.body;

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já cadastrado.' });
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar o usuário
    const newUser = await User.create({
      nome,
      email,
      telefone,
      senha: hashedPassword,
    });

    res.status(201).json({
      id: newUser._id,
      nome: newUser.nome,
      email: newUser.email,
      telefone: newUser.telefone,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao registrar usuário.', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verificar se o usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Verificar a senha
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Gerar o token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao realizar login.', error: err.message });
  }
};