const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quadra_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
  data: { type: Date, required: true },
  horario_inicio: { type: String, required: true }, // Formato HH:mm
  horario_fim: { type: String, required: true },   // Formato HH:mm
  status: {
    type: String,
    enum: ['pendente', 'confirmada', 'cancelada'], // Valores permitidos
    default: 'pendente', // Valor padrão ao criar
  },
});

module.exports = mongoose.model('Booking', BookingSchema);