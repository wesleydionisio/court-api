const mongoose = require('mongoose');

const CourtSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String },
  foto_principal: { type: String },
  galeria: [{ type: String }], // URLs das imagens
  duracao_padrao: { type: Number, required: true }, // em minutos
  esportes_permitidos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sport' }],
  horarios_reservados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  formas_pagamento: [{ type: String }], // Adicione este campo
});

module.exports = mongoose.model('Court', CourtSchema);