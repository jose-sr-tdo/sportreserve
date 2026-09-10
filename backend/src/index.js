import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import { AuthController } from './controllers/authController.js';
import { SpaceController } from './controllers/spaceController.js';
import { BookingController } from './controllers/bookingController.js';
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

// Rutas de Espacios
app.get('/api/spaces', SpaceController.getAll);
app.post('/api/spaces', authenticateToken, authorizeRoles('ADMIN'), SpaceController.create);

// Rutas de Reservas (Protegidas)
app.post('/api/reservations', authenticateToken, BookingController.create);
app.get('/api/reservations/my', authenticateToken, BookingController.getMine);
app.patch('/api/reservations/:id/cancel', authenticateToken, BookingController.cancel);

const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(` Servidor corriendo en: http://localhost:${PORT}`);
  });
};

startServer();