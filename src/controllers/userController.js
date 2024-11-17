// src/controllers/userController.js

const User = require('../models/User');

/**
 * Função para buscar dados de um usuário específico.
 */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('agendamentos');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    res.status(500).json({ success: false, message: 'Erro ao buscar usuário.', error: err.message });
  }
};

/**
 * Função para atualizar dados de um usuário.
 */
exports.updateUser = async (req, res) => {
  try {
    const { nome, telefone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { nome, telefone },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ success: false, message: 'Erro ao atualizar usuário.', error: err.message });
  }
};


/**
 * Função para excluir um usuário.
 */
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.status(200).json({ success: true, message: 'Usuário deletado com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar usuário:', err);
    res.status(500).json({ success: false, message: 'Erro ao deletar usuário.', error: err.message });
  }
};

/**
 * Função para obter o perfil do usuário autenticado.
 */
exports.getUserProfile = async (req, res) => {
  try {
    // `req.user` foi definido pelo middleware de autenticação
    const user = await User.findById(req.user.id).select('-senha'); // Excluir o campo 'senha'

    if (!user) {
      console.log('Usuário não encontrado no banco de dados.');
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error('Erro ao obter perfil do usuário:', err);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.',
    });
  }
};