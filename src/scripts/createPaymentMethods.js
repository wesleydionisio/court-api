const mongoose = require('mongoose');
const PaymentMethod = require('../models/PaymentMethod');

const paymentMethods = [
  {
    nome: 'Dinheiro',
    codigo: 'DINHEIRO',
    ativo: true,
    requer_pagamento_local: true
  },
  {
    nome: 'Cartão de Crédito',
    codigo: 'CARTAO_CREDITO',
    ativo: true,
    requer_pagamento_local: true
  },
  {
    nome: 'Cartão de Débito',
    codigo: 'CARTAO_DEBITO',
    ativo: true,
    requer_pagamento_local: true
  },
  {
    nome: 'PIX',
    codigo: 'PIX',
    ativo: true,
    requer_pagamento_local: false
  }
];

async function createPaymentMethods() {
  try {
    await mongoose.connect('mongodb+srv://wesleyrdionisio:oIDzL9vCTBLcffNw@cluster0.hlb3h.mongodb.net/agendamentos');
    console.log('Conectado ao MongoDB');
    
    // Limpar métodos existentes
    await PaymentMethod.deleteMany({});
    console.log('Métodos de pagamento anteriores removidos');
    
    // Inserir novos métodos
    const result = await PaymentMethod.insertMany(paymentMethods);
    console.log('\nMétodos de pagamento criados:');
    result.forEach(pm => {
      console.log(`ID: ${pm._id}, Nome: ${pm.nome}, Código: ${pm.codigo}`);
    });
    
  } catch (error) {
    console.error('Erro ao criar métodos de pagamento:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nConexão com MongoDB fechada');
  }
}

createPaymentMethods(); 