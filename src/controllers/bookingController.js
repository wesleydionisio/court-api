// src/controllers/bookingController.js

const mongoose = require('mongoose'); // **Adicionar esta linha**
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Sport = require('../models/Sport'); // Corrigido de Esporte para Sport
const User = require('../models/User'); // Adicionar importação do User se necessário
const Joi = require('joi');

// Função para criar uma reserva
exports.createBooking = async (req, res) => {
  try {
    // Definir o esquema de validação
    const schema = Joi.object({
      quadra_id: Joi.string().required(),
      data: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(), // Validar formato YYYY-MM-DD
      horario_inicio: Joi.string().pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/).required(),
      horario_fim: Joi.string().pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/).required(),
      esporte_id: Joi.string().required(),
      pagamento: Joi.string().valid('pagamento_no_ato', 'Dinheiro', 'Cartão de Crédito', 'Pix').required(),
    });

    // Validar os dados
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validação falhou.',
        errors: error.details.map(detail => detail.message),
      });
    }

    const { quadra_id, data, horario_inicio, horario_fim, esporte_id, pagamento } = value;

    // Verificar se a quadra existe
    const quadra = await Court.findById(quadra_id);
    if (!quadra) {
      return res.status(404).json({
        success: false,
        message: 'Quadra não encontrada.',
      });
    }

    // Verificar se o esporte selecionado é válido para a quadra
    if (!quadra.esportes_permitidos.some((esporte) => esporte.equals(esporte_id))) {
      return res.status(400).json({
        success: false,
        message: 'Esporte selecionado não é permitido para esta quadra.',
        errors: {
          esporte_id: 'Esporte inválido para a quadra selecionada.',
        },
      });
    }

    // Verificar disponibilidade, excluindo reservas canceladas
    const reservas = await Booking.find({
      quadra_id,
      data,
      status: { $ne: 'cancelada' }, // Excluir reservas canceladas
      $or: [
        { horario_inicio: { $lt: horario_fim, $gte: horario_inicio } },
        { horario_fim: { $gt: horario_inicio, $lte: horario_fim } },
        { $and: [
            { horario_inicio: { $lte: horario_inicio } },
            { horario_fim: { $gte: horario_fim } }
          ] 
        },
      ],
    });

    if (reservas.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Horário indisponível para reserva.',
        errors: {
          horario_inicio: 'Horário selecionado já está reservado.',
        },
      });
    }

    // Calcular o total da reserva (ajuste conforme sua lógica de negócios)
    const [inicioHora, inicioMinuto] = horario_inicio.split(':').map(Number);
    const [fimHora, fimMinuto] = horario_fim.split(':').map(Number);
    const duracaoHoras = fimHora - inicioHora + (fimMinuto - inicioMinuto) / 60;

    const precoPorHora = quadra.preco_por_hora || 100; // Defina um preço padrão ou obtenha do quadra/esporte
    const total = duracaoHoras * precoPorHora;

    // Criar a reserva
    const novaReserva = await Booking.create({
      usuario_id: req.user.id, // Obtido do token JWT
      quadra_id,
      data,
      horario_inicio,
      horario_fim,
      esporte: esporte_id,
      pagamento, // Valor já validado pelo enum
      total, // Adiciona o total calculado
      pague_no_local: pagamento === 'pagamento_no_ato', // Define se o pagamento é no local
    });

    res.status(201).json({
      success: true,
      message: 'Reserva criada com sucesso.',
      reserva: novaReserva,
    });
  } catch (err) {
    console.error('Erro ao criar reserva:', err);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar reserva.',
    });
  }
};

// Função para cancelar uma reserva
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params; // ID da reserva a ser cancelada

    // Verificar se a reserva existe e pertence ao usuário
    const booking = await Booking.findOne({ _id: id, usuario_id: req.user.id });
    if (!booking) {
      console.log(`Reserva com ID ${id} não encontrada ou não pertence ao usuário.`);
      return res.status(404).json({
        success: false,
        message: 'Reserva não encontrada ou não pertence ao usuário.',
      });
    }

    // Verificar se a reserva já está cancelada
    if (booking.status === 'cancelada') {
      console.log(`Reserva com ID ${id} já foi cancelada.`);
      return res.status(400).json({
        success: false,
        message: 'A reserva já foi cancelada.',
      });
    }

    // Verificar se a reserva já começou
    const now = Date.now(); // Timestamp atual em milissegundos

    // Extrair componentes de data e hora da reserva
    const bookingDateTime = new Date(booking.data);
    const [hour, minute] = booking.horario_inicio.split(':').map(Number);
    bookingDateTime.setHours(hour, minute, 0, 0);
    const bookingTimestamp = bookingDateTime.getTime();

    console.log(`Data atual (backend): ${new Date(now).toISOString()}`);
    console.log(`Data da reserva (backend): ${bookingDateTime.toISOString()}`);

    if (now >= bookingTimestamp) {
      console.log(`Não é possível cancelar uma reserva que já começou. (now: ${new Date(now).toISOString()} >= bookingDateTime: ${bookingDateTime.toISOString()})`);
      return res.status(400).json({
        success: false,
        message: 'Não é possível cancelar uma reserva que já começou.',
      });
    }

    // Atualizar o status da reserva para 'cancelada'
    booking.status = 'cancelada';
    await booking.save();

    console.log(`Reserva com ID ${id} foi cancelada com sucesso.`);

    res.status(200).json({
      success: true,
      message: 'Reserva cancelada com sucesso.',
      reserva: booking,
    });
  } catch (err) {
    console.error('Erro ao cancelar reserva:', err);
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar reserva.',
    });
  }
};

// Função para obter horários reservados para uma quadra em uma data específica
exports.getReservedTimes = async (req, res) => {
  try {
    const { quadraId } = req.params;
    const { data } = req.query;

    // Verificar se a quadra existe
    const quadra = await Court.findById(quadraId);
    if (!quadra) {
      return res.status(404).json({
        success: false,
        message: 'Quadra não encontrada.',
      });
    }

    // Usar a data fornecida ou o dia atual
    const dia = data || new Date().toISOString().split('T')[0];

    // Buscar reservas para a quadra na data especificada, excluindo canceladas
    const reservas = await Booking.find({
      quadra_id: quadraId,
      data: dia,
      status: { $ne: 'cancelada' }, // Excluir reservas canceladas
    });

    console.log(`Reservas para quadra ${quadraId} na data ${dia}:`, reservas);

    // Formatar os horários agendados
    const horariosAgendados = reservas.map((reserva) => ({
      inicio: reserva.horario_inicio,
      fim: reserva.horario_fim,
      status: reserva.status,
    }));

    res.status(200).json({
      success: true,
      quadra_id: quadraId,
      data: dia,
      horarios_agendados: horariosAgendados,
    });
  } catch (err) {
    console.error('Erro ao buscar horários agendados:', err);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar horários agendados.',
    });
  }
};

// Função para obter detalhes de uma reserva específica
// Função para obter detalhes de uma reserva específica
exports.getBookingById = async (req, res) => {
  const { id } = req.params; // **Mover esta linha para antes de usar 'id'**

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'ID inválido.' });
  }

  try {
    // Buscar a reserva pelo ID e popular os campos necessários
    const booking = await Booking.findById(id)
      .populate('quadra_id')
      .populate('esporte')
      .populate('usuario_id', 'nome'); // Popula apenas o campo 'nome' do usuário

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva não encontrada.',
      });
    }

    console.log(`Reserva encontrada: ${JSON.stringify(booking)}`);
    console.log(`ID do usuário autenticado: ${req.user.id}`);
    console.log(`ID do usuário da reserva: ${booking.usuario_id.id}`);

    // Verificar se a reserva pertence ao usuário autenticado usando o método 'equals'
    if (!booking.usuario_id.equals(req.user.id)) {
      console.log(`Usuário ${req.user.id} não tem permissão para acessar a reserva ${id}.`);
      return res.status(403).json({ success: false, message: 'Acesso negado.' });
    }

    // Estruturar os dados da reserva para a resposta
    const reservationData = {
      reservationId: booking._id,
      quadra_id: booking.quadra_id._id,
      nome: booking.quadra_id.nome,
      foto_principal: booking.quadra_id.foto_principal,
      data: booking.data.toISOString().split('T')[0], // Formato YYYY-MM-DD
      horario_inicio: booking.horario_inicio,
      horario_fim: booking.horario_fim,
      esporte: booking.esporte.nome,
      cliente: booking.usuario_id.nome, // Nome do cliente
      pagamento: booking.pagamento,
      total: booking.total,
      pague_no_local: booking.pague_no_local,
      status: booking.status,
    };

    res.status(200).json({
      success: true,
      reservation: reservationData,
    });
  } catch (err) {
    console.error('Erro ao buscar reserva:', err);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.',
    });
  }
};

// Função para obter todas as reservas do usuário
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id; // Obtido do middleware de autenticação
    const reservas = await Booking.find({ usuario_id: userId, status: { $ne: 'cancelada' } })
      .populate('quadra_id')
      .populate('esporte');

    res.status(200).json({
      success: true,
      reservas,
    });
  } catch (err) {
    console.error('Erro ao buscar reservas do usuário:', err);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.',
    });
  }
};