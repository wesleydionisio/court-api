const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('Conexão com o MongoDB estabelecida com sucesso.');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    process.exit(1); // Encerra o servidor caso o banco não conecte
  }
};

module.exports = connectDB;