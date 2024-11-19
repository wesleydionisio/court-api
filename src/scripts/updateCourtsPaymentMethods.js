const mongoose = require('mongoose');
const Court = require('../models/Court');
const PaymentMethod = require('../models/PaymentMethod');

async function updateCourtsPaymentMethods() {
  try {
    await mongoose.connect('mongodb+srv://wesleyrdionisio:oIDzL9vCTBLcffNw@cluster0.hlb3h.mongodb.net/agendamentos');
    console.log('Conectado ao MongoDB');
    
    // Buscar métodos de pagamento ativos
    const paymentMethods = await PaymentMethod.find({ ativo: true });
    console.log('\nMétodos de pagamento encontrados:', paymentMethods.length);
    paymentMethods.forEach(pm => {
      console.log(`ID: ${pm._id}, Nome: ${pm.nome}, Código: ${pm.codigo}`);
    });
    
    if (paymentMethods.length === 0) {
      console.log('Nenhum método de pagamento ativo encontrado');
      return;
    }

    // Preparar array de formas de pagamento
    const paymentMethodsData = paymentMethods.map(pm => 
      new mongoose.Types.ObjectId(pm._id)
    );

    // Atualizar cada quadra individualmente
    const courts = await Court.find();
    
    for (const court of courts) {
      console.log(`\nAtualizando quadra: ${court.nome}`);
      
      const updateResult = await Court.updateOne(
        { _id: court._id },
        { 
          $set: { 
            formas_pagamento: paymentMethodsData
          }
        }
      );
      
      console.log('Resultado da atualização:', updateResult);
    }
    
    // Verificar as quadras atualizadas
    const updatedCourts = await Court.find()
      .populate('formas_pagamento')
      .lean();
    
    // Mostrar resultado mais legível
    console.log('\nQuadras após atualização:');
    updatedCourts.forEach(court => {
      console.log(`\nQuadra: ${court.nome}`);
      console.log('Formas de pagamento:');
      court.formas_pagamento.forEach(fp => {
        console.log(`- ID: ${fp._id}, Nome: ${fp.nome}, Código: ${fp.codigo}`);
      });
    });
    
  } catch (error) {
    console.error('Erro ao atualizar quadras:', error);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\nConexão com MongoDB fechada');
  }
}

updateCourtsPaymentMethods(); 