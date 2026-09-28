// backend/src/patterns/navigationStrategy.js

// Interfaz base (Estrategia)
class NavigationStrategy {
  navigate(spaces, date, existingReservations) {
    throw new Error('Método navigate() debe ser implementado');
  }
}

// Patrón Iterator para recorrer franjas de 1 hora
class TimeSlotIterator {
  constructor(startHour = 8, endHour = 20) {
    this.currentHour = startHour;
    this.endHour = endHour;
  }

  hasNext() {
    return this.currentHour < this.endHour;
  }

  next() {
    const start = `${String(this.currentHour).padStart(2, '0')}:00:00`;
    this.currentHour++;
    const end = `${String(this.currentHour).padStart(2, '0')}:00:00`;
    return { startTime: start, endTime: end };
  }
}

// Estrategia 1: Primer horario disponible (Búsqueda voraz / Inmediatez)
export class EarliestAvailableStrategy extends NavigationStrategy {
  navigate(spaces, date, existingReservations) {
    for (const space of spaces) {
      const iterator = new TimeSlotIterator(8, 20);
      while (iterator.hasNext()) {
        const slot = iterator.next();
        const isOccupied = existingReservations.some(r => 
          r.space_id === space.id &&
          r.reservation_date.split('T')[0] === date &&
          r.status === 'CONFIRMED' &&
          (r.start_time < slot.endTime && r.end_time > slot.startTime)
        );

        if (!isOccupied) {
          return {
            strategyUsed: 'EARLIEST_AVAILABLE',
            space: space,
            recommendedSlot: slot,
            date: date
          };
        }
      }
    }
    return null;
  }
}

// Estrategia 2: Priorizar Canchas de Mayor Capacidad
export class MaxCapacityStrategy extends NavigationStrategy {
  navigate(spaces, date, existingReservations) {
    const sortedSpaces = [...spaces].sort((a, b) => (b.capacity || 0) - (a.capacity || 0));

    for (const space of sortedSpaces) {
      const iterator = new TimeSlotIterator(8, 20);
      while (iterator.hasNext()) {
        const slot = iterator.next();
        const isOccupied = existingReservations.some(r => 
          r.space_id === space.id &&
          r.reservation_date.split('T')[0] === date &&
          r.status === 'CONFIRMED' &&
          (r.start_time < slot.endTime && r.end_time > slot.startTime)
        );

        if (!isOccupied) {
          return {
            strategyUsed: 'MAX_CAPACITY',
            space: space,
            recommendedSlot: slot,
            date: date
          };
        }
      }
    }
    return null;
  }
}

// Contexto de Navegación
export class NavigationContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  executeNavigation(spaces, date, existingReservations) {
    return this.strategy.navigate(spaces, date, existingReservations);
  }
}