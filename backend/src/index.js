import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import { AuthController } from './controllers/authController.js';
import { authenticateToken, authorizeRoles } from './middlewares/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SportReserve API operando correctamente' });
});

// Rutas de Autenticación
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);
app.get('/api/auth/profile', authenticateToken, AuthController.getProfile);

// Ruta de prueba protegida solo para ADMIN
app.get('/api/admin/dashboard', authenticateToken, authorizeRoles('ADMIN'), (req, res) => {
  res.status(200).json({ message: 'Bienvenido al panel administrativo', user: req.user });
});

const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(` Servidor corriendo en: http://localhost:${PORT}`);
  });
};

startServer();