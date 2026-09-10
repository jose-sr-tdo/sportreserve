import { pool } from '../config/db.js';
import { ReservationRepository } from '../repositories/reservationRepository.js';
import { SpaceRepository } from '../repositories/spaceRepository.js';
import { UserRepository } from '../repositories/userRepository.js';
import { eventBus } from '../patterns/eventEmitter.js';

export class BookingService {
  static async createReservation({ userId, spaceId, date, startTime, endTime }) {
    // 1. Validar existencia y estado del espacio
    const space = await SpaceRepository.findById(spaceId);
    if (!space || !space.is_active) {
      const error = new Error('El espacio deportivo no existe o está inactivo');
      error.statusCode = 404;
      throw error;
    }

    // 2. Validar coherencia de horarios
    if (startTime >= endTime) {
      const error = new Error('La hora de inicio debe ser anterior a la hora de fin');
      error.statusCode = 400;
      throw error;
    }

    // 3. Obtener conexión exclusiva para manejo de Transacción ACID en MySQL
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Verificar colisión horaria con bloqueo lógico
      const hasCollision = await ReservationRepository.checkCollision({
        spaceId,
        date,
        startTime,
        endTime,
        connection
      });

      if (hasCollision) {
        const error = new Error('El espacio ya cuenta con una reserva confirmada en ese rango de horario');
        error.statusCode = 409; // Conflicto
        throw error;
      }

      // Crear la reserva dentro de la transacción
      const newReservation = await ReservationRepository.create({
        userId,
        spaceId,
        date,
        startTime,
        endTime,
        connection
      });

      await connection.commit();

      // 4. Disparar evento desacoplado (Observer)
      const user = await UserRepository.findById(userId);
      eventBus.emit('RESERVATION_CREATED', {
        userEmail: user.email,
        userName: user.name,
        spaceName: space.name,
        date,
        startTime,
        endTime
      });

      return newReservation;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getMyReservations(userId) {
    return await ReservationRepository.findByUserId(userId);
  }

  static async cancelReservation({ reservationId, userId, userRole }) {
    const reservation = await ReservationRepository.findById(reservationId);
    if (!reservation) {
      const error = new Error('Reserva no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Validación de autorización: Solo el dueño de la reserva o un ADMIN pueden cancelar
    if (reservation.user_id !== userId && userRole !== 'ADMIN') {
      const error = new Error('No tiene autorización para cancelar esta reserva');
      error.statusCode = 403;
      throw error;
    }

    if (reservation.status === 'CANCELLED') {
      const error = new Error('La reserva ya se encuentra cancelada');
      error.statusCode = 400;
      throw error;
    }

    await ReservationRepository.updateStatus(reservationId, 'CANCELLED');

    // Notificar cancelación (Observer)
    const user = await UserRepository.findById(reservation.user_id);
    const space = await SpaceRepository.findById(reservation.space_id);

    eventBus.emit('RESERVATION_CANCELLED', {
      userEmail: user.email,
      userName: user.name,
      spaceName: space ? space.name : 'Espacio deportivo',
      date: reservation.reservation_date
    });

    return { message: 'Reserva cancelada exitosamente', id: reservationId };
  }
}