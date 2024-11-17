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
});

module.exports = mongoose.model('Booking', BookingSchema);