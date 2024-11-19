const Sport = require('../models/Sport');
const Court = require('../models/Court');
const Booking = require('../models/Booking');
const PaymentMethod = require('../models/PaymentMethod');
const mongoose = require('mongoose');


exports.getCourts = async (req, res) => {
  try {
    console.log('Iniciando busca de quadras...');
    
    // Buscar quadras e popular tanto esportes quanto formas de pagamento
    const courts = await Court.find()
      .populate('esportes_permitidos')
      .populate('formas_pagamento');
    
    console.log('Quadras encontradas:', courts);

    res.status(200).json({
      success: true,
      courts: courts
    });
  } catch (err) {
    console.error('Erro ao buscar quadras:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar quadras.',
      error: err.message 
    });
  }
};

exports.getCourtById = async (req, res) => {
  try {
    console.log('Buscando quadra com ID:', req.params.id);
    
    const court = await Court.findById(req.params.id)
      .populate('esportes_permitidos')
      .populate({
        path: 'formas_pagamento',
        match: { ativo: true },
        select: '_id nome codigo ativo'
      });
    
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Quadra não encontrada'
      });
    }

    console.log('Métodos de pagamento da quadra:', court.formas_pagamento);

    res.status(200).json({
      success: true,
      court: court
    });
  } catch (error) {
    console.error('Erro ao buscar quadra:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar quadra',
      error: error.message
    });
  }
};

exports.createCourt = async (req, res) => {
  try {
    console.log('Dados recebidos:', req.body);

    // Validar se os IDs dos esportes são válidos
    const esportesIds = req.body.esportes_permitidos.map(id => 
      mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null
    );
    
    console.log('IDs dos esportes convertidos:', esportesIds);

    // Verificar se todos os esportes existem
    const esportesEncontrados = await Sport.find({
      '_id': { $in: esportesIds }
    });

    console.log('Esportes encontrados:', esportesEncontrados);

    if (esportesEncontrados.length !== esportesIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Alguns esportes fornecidos não foram encontrados no banco de dados.'
      });
    }

    // Se não houver métodos de pagamento definidos, usar os padrões
    if (!req.body.formas_pagamento || req.body.formas_pagamento.length === 0) {
      const defaultPayments = await PaymentMethod.find({ ativo: true });
      if (defaultPayments.length > 0) {
        req.body.formas_pagamento = defaultPayments.map(p => p._id);
      }
    }

    // Criar a quadra com os métodos de pagamento
    const novaQuadra = await Court.create({
      nome: req.body.nome,
      descricao: req.body.descricao,
      foto_principal: req.body.foto_principal,
      galeria: req.body.galeria,
      duracao_padrao: req.body.duracao_padrao,
      preco_por_hora: req.body.preco_por_hora,
      esportes_permitidos: esportesIds,
      formas_pagamento: req.body.formas_pagamento
    });

    // Popular os métodos de pagamento antes de retornar
    await novaQuadra.populate('formas_pagamento');

    console.log('Quadra criada:', novaQuadra);

    res.status(201).json({
      success: true,
      message: 'Quadra criada com sucesso',
      court: novaQuadra
    });

  } catch (error) {
    console.error('Erro detalhado ao criar quadra:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar quadra',
      error: error.message
    });
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
      formas_pagamento, // Adicionado este campo
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

exports.getReservedTimes = async (req, res) => {
  try {
    const { id } = req.params; // ID da quadra
    const { data } = req.query; // Data no formato YYYY-MM-DD

    // Verificar se a quadra existe
    const court = await Court.findById(id);
    if (!court) {
      return res.status(404).json({ message: 'Quadra no encontrada.' });
    }

    // Buscar reservas para a quadra na data especificada
    const reservas = await Booking.find({ 
      quadra_id: id, 
      data 
    });

    // Formatar os horários reservados
    const horariosReservados = reservas.map((reserva) => ({
      inicio: reserva.horario_inicio,
      fim: reserva.horario_fim,
    }));

    res.status(200).json({ horariosReservados });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar horários reservados.', error: err.message });
  }
};