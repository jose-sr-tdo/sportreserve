import { pool } from '../config/db.js';

export class ReservationRepository {
  // Verifica si ya existe una reserva activa que colisione con el horario solicitado
  static async checkCollision({ spaceId, date, startTime, endTime, connection = pool }) {
    const query = `
      SELECT id FROM reservations
      WHERE space_id = ? 
        AND reservation_date = ? 
        AND status = 'CONFIRMED'
        AND (start_time < ? AND end_time > ?)
      LIMIT 1
    `;
    const [rows] = await connection.query(query, [spaceId, date, endTime, startTime]);
    return rows.length > 0;
  }

  static async create({ userId, spaceId, date, startTime, endTime, connection = pool }) {
    const query = `
      INSERT INTO reservations (user_id, space_id, reservation_date, start_time, end_time, status)
      VALUES (?, ?, ?, ?, ?, 'CONFIRMED')
    `;
    const [result] = await connection.query(query, [userId, spaceId, date, startTime, endTime]);
    return { id: result.insertId, userId, spaceId, date, startTime, endTime, status: 'CONFIRMED' };
  }

  static async findByUserId(userId) {
    const query = `
      SELECT r.id, r.reservation_date, r.start_time, r.end_time, r.status,
             s.name AS space_name, s.type AS space_type
      FROM reservations r
      INNER JOIN spaces s ON r.space_id = s.id
      WHERE r.user_id = ?
      ORDER BY r.reservation_date DESC, r.start_time DESC
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM reservations WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async updateStatus(id, status) {
    await pool.query('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
    return { id, status };
  }

  static async findBySpaceAndDate(spaceId, date) {
    const query = `
      SELECT start_time, end_time, status 
      FROM reservations 
      WHERE space_id = ? AND reservation_date = ? AND status = 'CONFIRMED'
      ORDER BY start_time ASC
    `;
    const [rows] = await pool.query(query, [spaceId, date]);
    return rows;
  }
}