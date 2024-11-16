const Sport = require('../models/Sport');
const Court = require('../models/Court');

exports.getCourts = async (req, res) => {
  try {
    const courts = await Court.find().populate('esportes_permitidos');
    res.status(200).json(courts);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar quadras.', error: err.message });
  }
};

exports.getCourtById = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id).populate('esportes_permitidos');
    if (!court) {
      return res.status(404).json({ message: 'Quadra não encontrada.' });
    }
    res.status(200).json(court);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar quadra.', error: err.message });
  }
};

exports.createCourt = async (req, res) => {
  try {
    const {
      nome,
      descricao,
      foto_principal,
      galeria,
      duracao_padrao,
      esportes_permitidos, // Recebe nomes como ['Futebol', 'Basquete']
    } = req.body;

    // Converter nomes de esportes para seus respectivos IDs
    const esportes = await Sport.find({ nome: { $in: esportes_permitidos } });
    if (esportes.length !== esportes_permitidos.length) {
      return res.status(400).json({
        message: 'Alguns esportes fornecidos não foram encontrados no banco de dados.',
      });
    }
    const esportesIds = esportes.map((esporte) => esporte._id);

    // Criar quadra
    const newCourt = await Court.create({
      nome,
      descricao,
      foto_principal,
      galeria,
      duracao_padrao,
      esportes_permitidos: esportesIds,
    });

    res.status(201).json(newCourt);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar quadra.', error: err.message });
  }
};

exports.updateCourt = async (req, res) => {
  try {
    const {
      nome,
      descricao,
      foto_principal,
      galeria,
      duracao_padrao,
      esportes_permitidos,
    } = req.body;

    // Converter nomes de esportes para seus respectivos IDs
    const esportes = await Sport.find({ nome: { $in: esportes_permitidos } });
    const esportesIds = esportes.map((esporte) => esporte._id);

    const updatedCourt = await Court.findByIdAndUpdate(
      req.params.id,
      {
        nome,
        descricao,
        foto_principal,
        galeria,
        duracao_padrao,
        esportes_permitidos: esportesIds,
      },
      { new: true }
    );

    if (!updatedCourt) {
      return res.status(404).json({ message: 'Quadra não encontrada.' });
    }

    res.status(200).json(updatedCourt);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar quadra.', error: err.message });
  }
};

exports.deleteCourt = async (req, res) => {
  try {
    const deletedCourt = await Court.findByIdAndDelete(req.params.id);
    if (!deletedCourt) {
      return res.status(404).json({ message: 'Quadra não encontrada.' });
    }
    res.status(200).json({ message: 'Quadra deletada com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao deletar quadra.', error: err.message });
  }
};