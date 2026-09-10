import { SpaceRepository } from '../repositories/spaceRepository.js';

export class SpaceController {
  static async getAll(req, res) {
    try {
      const spaces = await SpaceRepository.findAllActive();
      return res.status(200).json(spaces);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { name, type, capacity } = req.body;
      if (!name || !type) {
        return res.status(400).json({ message: 'Nombre y tipo son obligatorios' });
      }
      const space = await SpaceRepository.create({ name, type, capacity });
      return res.status(201).json(space);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}