import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository.js';

export class AuthService {
  static async register({ name, email, password, role }) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('El correo electrónico ya está registrado');
      error.statusCode = 409;
      throw error;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await UserRepository.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'DEPORTISTA'
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };
  }

  static async login({ email, password }) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secreto_academico_sportreserve_2026',
      { expiresIn: '8h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }
}