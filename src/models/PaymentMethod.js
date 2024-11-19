const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  nome: String,
  codigo: String,
  ativo: Boolean,
  requer_pagamento_local: Boolean
}, {
  timestamps: true,
  collection: 'paymentmethods'
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema); 