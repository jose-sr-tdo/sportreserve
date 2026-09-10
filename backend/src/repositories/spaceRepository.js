import { pool } from '../config/db.js';

export class SpaceRepository {
  static async findAllActive() {
    const [rows] = await pool.query(
      'SELECT id, name, type, capacity FROM spaces WHERE is_active = 1'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, type, capacity, is_active FROM spaces WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create({ name, type, capacity }) {
    const [result] = await pool.query(
      'INSERT INTO spaces (name, type, capacity) VALUES (?, ?, ?)',
      [name, type, capacity]
    );
    return { id: result.insertId, name, type, capacity };
  }
}