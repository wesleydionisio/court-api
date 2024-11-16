const Booking = require('../models/Booking');
const Court = require('../models/Court');

exports.createBooking = async (req, res) => {
  try {
    const { quadra_id, data, horario_inicio, horario_fim } = req.body;

    // Verificar se a quadra existe
    const quadra = await Court.findById(quadra_id);
    if (!quadra) {
      return res.status(404).json({ message: 'Quadra não encontrada.' });
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
      return res.status(400).json({ message: 'Horário indisponível para reserva.' });
    }

    // Criar a reserva
    const novaReserva = await Booking.create({
      usuario_id: req.user.id, // Obtido do token JWT
      quadra_id,
      data,
      horario_inicio,
      horario_fim,
    });

    res.status(201).json({
      message: 'Reserva criada com sucesso.',
      reserva: novaReserva,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar reserva.', error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params; // ID da reserva a ser cancelada

    // Verificar se a reserva existe e pertence ao usuário
    const booking = await Booking.findOne({ _id: id, usuario_id: req.user.id });
    if (!booking) {
      return res.status(404).json({ message: 'Reserva não encontrada ou não pertence ao usuário.' });
    }

    // Atualizar o status da reserva para 'cancelada'
    booking.status = 'cancelada';
    await booking.save();

    res.status(200).json({
      message: 'Reserva cancelada com sucesso.',
      reserva: booking,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao cancelar reserva.', error: err.message });
  }
};

exports.getReservedTimes = async (req, res) => {
  try {
    const { quadraId } = req.params;
    const { data } = req.query;

    // Verificar se a quadra existe
    const quadra = await Court.findById(quadraId);
    if (!quadra) {
      return res.status(404).json({ message: 'Quadra não encontrada.' });
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
      quadra_id: quadraId,
      data: dia,
      horarios_agendados: horariosAgendados,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar horários agendados.', error: err.message });
  }
};