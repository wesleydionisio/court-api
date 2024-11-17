// controllers/authController.js
const User = require('../models/User'); // Modelo do usuário
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { nome, email, telefone, senha } = req.body;

    // Verificar se todos os campos estão presentes
    if (!nome || !email || !telefone || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, preencha todos os campos.',
        errors: {
          nome: !nome ? 'Nome é obrigatório.' : undefined,
          email: !email ? 'Email é obrigatório.' : undefined,
          telefone: !telefone ? 'Telefone é obrigatório.' : undefined,
          senha: !senha ? 'Senha é obrigatória.' : undefined,
        },
      });
    }

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe com este email.',
        errors: {
          email: 'Email já está em uso.',
        },
      });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedSenha = await bcrypt.hash(senha, salt);

    // Criar novo usuário
    const newUser = new User({
      nome,
      email,
      telefone,
      senha: hashedSenha,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso!',
    });
  } catch (err) {
    console.error('Erro ao criar conta:', err);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar conta.',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, preencha todos os campos.',
        errors: {
          email: !email ? 'Email é obrigatório.' : undefined,
          senha: !senha ? 'Senha é obrigatória.' : undefined,
        },
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não encontrado.',
        errors: {
          email: 'Nenhum usuário encontrado com este email.',
        },
      });
    }

    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Senha inválida.',
        errors: {
          senha: 'Senha incorreta.',
        },
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.status(200).json({ success: true, token });
  } catch (err) {
    console.error('Erro ao fazer login:', err);
    res.status(500).json({ success: false, message: 'Erro ao fazer login.' });
  }
};