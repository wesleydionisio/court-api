// models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quadra_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
  data: { type: Date, required: true },
  horario_inicio: { type: String, required: true }, // Formato HH:mm
  horario_fim: { type: String, required: true },   // Formato HH:mm
  esporte: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
  pagamento: {
    type: String,
    enum: ['pagamento_no_ato', 'Dinheiro', 'Cartão de Crédito', 'Pix'],
    default: 'pagamento_no_ato',
  },
  status: {
    type: String,
    enum: ['pendente', 'confirmada', 'cancelada'],
    default: 'pendente',
  },
  total: { type: Number, required: true }, // Total da reserva
  pague_no_local: { type: Boolean, default: true }, // Se o pagamento é no local
}, { timestamps: true });

// Adiciona um índice composto para melhorar a performance das consultas
BookingSchema.index({ quadra_id: 1, data: 1, status: 1, horario_inicio: 1, horario_fim: 1 });

module.exports = mongoose.model('Booking', BookingSchema);