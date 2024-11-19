const PaymentMethod = require('../models/PaymentMethod');
const Court = require('../models/Court');

class PaymentMethodService {
  async getCourtPaymentMethods(courtId) {
    try {
      // Busca a quadra e popula os métodos de pagamento ativos
      const court = await Court.findById(courtId)
        .populate({
          path: 'formas_pagamento',
          match: { ativo: true },
          select: '_id nome codigo ativo'
        });

      if (!court) {
        throw new Error('Quadra não encontrada');
      }

      // Se a quadra não tiver métodos específicos, retorna os métodos padrão
      if (!court.formas_pagamento || court.formas_pagamento.length === 0) {
        return await this.getDefaultPaymentMethods();
      }

      return court.formas_pagamento;
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      throw error;
    }
  }

  async getDefaultPaymentMethods() {
    return await PaymentMethod.find({ ativo: true });
  }

  async initializeDefaultMethods() {
    const defaultMethods = [
      { nome: 'PIX', codigo: 'PIX', ativo: true },
      { nome: 'Dinheiro', codigo: 'CASH', ativo: true },
      { nome: 'Cartão de Crédito', codigo: 'CREDIT', ativo: true },
      { nome: 'Cartão de Débito', codigo: 'DEBIT', ativo: true }
    ];

    try {
      const operations = defaultMethods.map(method => ({
        updateOne: {
          filter: { codigo: method.codigo },
          update: { $set: method },
          upsert: true
        }
      }));

      await PaymentMethod.bulkWrite(operations);
      console.log('Métodos de pagamento padrão inicializados com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar métodos de pagamento:', error);
      throw error;
    }
  }
}

module.exports = new PaymentMethodService(); 