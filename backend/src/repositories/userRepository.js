import { pool } from '../config/db.js';

export class UserRepository {
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create({ name, email, password, role = 'DEPORTISTA' }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return { id: result.insertId, name, email, role };
  }
}