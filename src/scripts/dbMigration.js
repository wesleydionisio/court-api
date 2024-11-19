const mongoose = require('mongoose');
const PaymentMethod = require('../models/PaymentMethod');
const Booking = require('../models/Booking');
const Court = require('../models/Court');

const MONGODB_URI = 'mongodb+srv://wesleyrdionisio:oIDzL9vCTBLcffNw@cluster0.hlb3h.mongodb.net/agendamentos?retryWrites=true&w=majority';

async function migrate() {
  try {
    // 1. Conectar ao MongoDB Atlas
    console.log('Conectando ao MongoDB Atlas (banco agendamentos)...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log('Conectado com sucesso!');

    // 2. Criar métodos de pagamento
    console.log('Criando métodos de pagamento...');
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

    // Criar collection paymentmethods se não existir
    const collections = await mongoose.connection.db.listCollections().toArray();
    if (!collections.find(c => c.name === 'paymentmethods')) {
      await mongoose.connection.db.createCollection('paymentmethods');
    }

    // Limpar métodos existentes e criar novos
    await PaymentMethod.deleteMany({});
    const createdMethods = await PaymentMethod.insertMany(paymentMethods);
    console.log(`${createdMethods.length} métodos de pagamento criados`);

    // 3. Atualizar reservas existentes
    console.log('Atualizando reservas existentes...');
    const defaultPaymentMethod = createdMethods.find(m => m.codigo === 'DINHEIRO')._id;
    
    const bookingUpdateResult = await Booking.updateMany(
      { pagamento: { $type: 'string' } }, // atualiza apenas onde pagamento é string
      { 
        $set: { 
          pagamento: defaultPaymentMethod,
          total: 100, // valor padrão
          pague_no_local: true
        }
      }
    );
    console.log(`${bookingUpdateResult.modifiedCount} reservas atualizadas`);

    // 4. Atualizar quadras
    console.log('Atualizando quadras...');
    const courtUpdateResult = await Court.updateMany(
      {},
      { 
        $set: { 
          formas_pagamento: createdMethods.map(method => method._id) 
        }
      }
    );
    console.log(`${courtUpdateResult.modifiedCount} quadras atualizadas`);

    console.log('Migração concluída com sucesso!');

  } catch (error) {
    console.error('Erro detalhado:', error);
    if (error.name === 'MongooseServerSelectionError') {
      console.error('Não foi possível conectar ao MongoDB Atlas.');
      console.error('Por favor, verifique:');
      console.error('1. Se suas credenciais estão corretas');
      console.error('2. Se seu IP está na whitelist do Atlas');
      console.error('3. Se a string de conexão está correta');
    }
  } finally {
    try {
      await mongoose.connection.close();
      console.log('Conexão com o MongoDB fechada');
    } catch (err) {
      console.error('Erro ao fechar conexão:', err);
    }
    process.exit(0);
  }
}

// Executar a migração com melhor tratamento de erros
migrate().catch((error) => {
  console.error('Erro fatal durante a migração:', error);
  process.exit(1);
}); 