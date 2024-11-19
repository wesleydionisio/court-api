const mongoose = require('mongoose');

const CourtSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String },
  foto_principal: { type: String },
  galeria: [{ type: String }],
  duracao_padrao: { type: Number, required: true },
  esportes_permitidos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sport' }],
  horarios_reservados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  formas_pagamento: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod' }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Court', CourtSchema);