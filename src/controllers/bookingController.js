// src/controllers/bookingController.js
const Booking = require('../models/Booking');
const Court = require('../models/Court');

exports.createBooking = async (req, res) => {
  try {
    const { quadra_id, data, horario_inicio, horario_fim, esporte_id, pagamento } = req.body;

    // Validação básica dos campos
    if (!quadra_id || !data || !horario_inicio || !horario_fim || !esporte_id || !pagamento) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, preencha todos os campos.',
        errors: {
          quadra_id: !quadra_id ? 'Quadra é obrigatória.' : undefined,
          data: !data ? 'Data é obrigatória.' : undefined,
          horario_inicio: !horario_inicio ? 'Horário de início é obrigatório.' : undefined,
          horario_fim: !horario_fim ? 'Horário de fim é obrigatório.' : undefined,
          esporte_id: !esporte_id ? 'Esporte é obrigatório.' : undefined,
          pagamento: !pagamento ? 'Forma de pagamento é obrigatória.' : undefined,
        },
      });
    }

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

    // Verificar disponibilidade
    const reservas = await Booking.find({
      quadra_id,
      data,
      $or: [
        { horario_inicio: { $lt: horario_fim, $gte: horario_inicio } },
        { horario_fim: { $gt: horario_inicio, $lte: horario_fim } },
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

    // Criar a reserva
    const novaReserva = await Booking.create({
      usuario_id: req.user.id, // Obtido do token JWT
      quadra_id,
      data,
      horario_inicio,
      horario_fim,
      esporte: esporte_id,
      pagamento, // Valor já validado pelo enum
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

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params; // ID da reserva a ser cancelada

    // Verificar se a reserva existe e pertence ao usuário
    const booking = await Booking.findOne({ _id: id, usuario_id: req.user.id });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva não encontrada ou não pertence ao usuário.',
      });
    }

    // Atualizar o status da reserva para 'cancelada'
    booking.status = 'cancelada';
    await booking.save();

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

    // Buscar reservas para a quadra na data especificada
    const reservas = await Booking.find({ quadra_id: quadraId, data: dia });

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