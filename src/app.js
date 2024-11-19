const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courtRoutes = require('./routes/courtRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentMethodRoutes = require('./routes/paymentMethodRoutes');
const { checkAndCreateDefaultPayments } = require('./controllers/paymentMethodController');

const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware para JSON
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);

// Middleware de erro global
app.use(errorHandler);

// Rota padrão
app.get('/', (req, res) => res.send('API em funcionamento!'));

// Inicialização do servidor
const PORT = process.env.PORT || 3000;

// Conectar ao MongoDB e iniciar o servidor
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Conectado ao MongoDB');
  
  try {
    // Inicializar métodos de pagamento padrão
    await checkAndCreateDefaultPayments();
    console.log('Métodos de pagamento padrão verificados/criados com sucesso');
    
    // Iniciar o servidor apenas após a inicialização dos métodos de pagamento
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao inicializar métodos de pagamento:', error);
    process.exit(1); // Encerra o processo em caso de erro crítico
  }
})
.catch(err => {
  console.error('Erro ao conectar ao MongoDB:', err);
  process.exit(1);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('Erro não tratado:', err);
  // Fecha o servidor graciosamente e encerra o processo
  server.close(() => process.exit(1));
});