const express = require('express');
const router = express.Router();
const Court = require('../models/Court');
const PaymentMethod = require('../models/PaymentMethod');

// Rota para buscar métodos de pagamento de uma quadra específica
router.get('/courts/:courtId', async (req, res) => {
  try {
    const court = await Court.findById(req.params.courtId)
      .populate('formas_pagamento');
    
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Quadra não encontrada'
      });
    }

    // Buscar os métodos de pagamento ativos
    const paymentMethods = await PaymentMethod.find({
      _id: { $in: court.formas_pagamento },
      ativo: true
    });

    return res.json({
      success: true,
      paymentMethods
    });

  } catch (error) {
    console.error('Erro ao buscar métodos de pagamento:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar métodos de pagamento'
    });
  }
});

module.exports = router; 