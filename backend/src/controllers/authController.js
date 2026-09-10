import { AuthService } from '../services/authService.js';

export class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: name, email, password' });
      }

      const user = await AuthService.register({ name, email, password, role });
      return res.status(201).json({ message: 'Usuario registrado con éxito', user });
    } catch (error) {
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Debe ingresar correo y contraseña' });
      }

      const result = await AuthService.login({ email, password });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  static async getProfile(req, res) {
    return res.status(200).json({ user: req.user });
  }
}