const User = require('../models/User');

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('agendamentos');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar usuário.', error: err.message });
  }
};

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

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar usuário.', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.status(200).json({ message: 'Usuário deletado com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao deletar usuário.', error: err.message });
  }
};