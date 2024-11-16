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