import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import { AuthController } from './controllers/authController.js';
import { SpaceController } from './controllers/spaceController.js';
import { BookingController } from './controllers/bookingController.js';
import { authenticateToken, authorizeRoles } from './middlewares/authMiddleware.js';
import { NavigationService } from './services/navigationService.js';

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

// Rutas de Reservas
// Consulta pública de disponibilidad por fecha y espacio
app.get('/api/reservations/availability', BookingController.getBySpaceAndDate);

// Rutas de Reservas (Protegidas)
app.post('/api/reservations', authenticateToken, BookingController.create);
app.get('/api/reservations/my', authenticateToken, BookingController.getMine);
app.patch('/api/reservations/:id/cancel', authenticateToken, BookingController.cancel);

// Endpoint de Navegación y Recorrido Asistido (Unidad 3 - Actividad 6)
app.get('/api/navigation/optimal', async (req, res) => {
  try {
    const { criteria = 'EARLIEST', date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'El parámetro date (YYYY-MM-DD) es requerido' });
    }
    const result = await NavigationService.findOptimalRoute(criteria, date);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(` Servidor corriendo en: http://localhost:${PORT}`);
  });
};

startServer();