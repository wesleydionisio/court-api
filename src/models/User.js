// src/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  senha: {
    type: String,
    required: true,
    minlength: 6,
  },
  telefone: {
    type: String,
    required: false,
    trim: true,
  },
  agendamentos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);