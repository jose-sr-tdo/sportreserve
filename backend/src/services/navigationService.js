// backend/src/services/navigationService.js
import { SpaceRepository } from '../repositories/spaceRepository.js';
import { pool as db } from '../config/db.js';
import { 
  NavigationContext, 
  EarliestAvailableStrategy, 
  MaxCapacityStrategy 
} from '../patterns/navigationStrategy.js';

export class NavigationService {
  static async findOptimalRoute(criteria, date) {
    const spaces = await SpaceRepository.findAllActive();
    const [reservations] = await db.query(
      `SELECT space_id, DATE_FORMAT(reservation_date, '%Y-%m-%d') as reservation_date, start_time, end_time, status 
       FROM reservations 
       WHERE reservation_date = ? AND status = 'CONFIRMED'`,
      [date]
    );

    let strategy;
    if (criteria === 'CAPACITY') {
      strategy = new MaxCapacityStrategy();
    } else {
      strategy = new EarliestAvailableStrategy();
    }

    const context = new NavigationContext(strategy);
    const result = context.executeNavigation(spaces, date, reservations);

    return result || { message: 'No se encontraron franjas disponibles para esta fecha' };
  }
}