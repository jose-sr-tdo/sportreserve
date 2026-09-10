import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Endpoint de prueba de salud (Health check)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SportReserve API operando correctamente' });
});

// Inicialización del servidor
const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(` Servidor corriendo en: http://localhost:${PORT}`);
    console.log(` Endpoint de prueba: http://localhost:${PORT}/api/health`);
  });
};

startServer();