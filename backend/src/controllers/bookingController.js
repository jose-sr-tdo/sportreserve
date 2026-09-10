import { BookingService } from '../services/bookingService.js';

export class BookingController {
  static async create(req, res) {
    try {
      const { spaceId, date, startTime, endTime } = req.body;
      const userId = req.user.id;

      if (!spaceId || !date || !startTime || !endTime) {
        return res.status(400).json({ message: 'Todos los campos de horario y espacio son obligatorios' });
      }

      const reservation = await BookingService.createReservation({
        userId,
        spaceId,
        date,
        startTime,
        endTime
      });

      return res.status(201).json({
        message: 'Reserva creada exitosamente',
        reservation
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  static async getMine(req, res) {
    try {
      const reservations = await BookingService.getMyReservations(req.user.id);
      return res.status(200).json(reservations);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async cancel(req, res) {
    try {
      const { id } = req.params;
      const result = await BookingService.cancelReservation({
        reservationId: id,
        userId: req.user.id,
        userRole: req.user.role
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}