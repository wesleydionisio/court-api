require('dotenv').config(); // Carrega variáveis de ambiente do .env
const express = require('express');
const connectDB = require('./config/database'); // Configuração do banco de dados
const authRoutes = require('./routes/authRoutes'); // Rotas de autenticação
const userRoutes = require('./routes/userRoutes'); // Rotas de usuários
const courtRoutes = require('./routes/courtRoutes'); // Rotas de quadras
const bookingRoutes = require('./routes/bookingRoutes'); // Rotas de agendamentos
const errorHandler = require('./middlewares/errorHandler'); // Middleware para erros

const app = express();

// Middleware para analisar requisições JSON
app.use(express.json());

// Conectar ao banco de dados
connectDB();

// Rotas principais
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/bookings', bookingRoutes);

// Middleware de erros
app.use(errorHandler);

// Rota padrão para testar o servidor
app.get('/', (req, res) => {
  res.send('API em funcionamento!');
});

// Inicializar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});