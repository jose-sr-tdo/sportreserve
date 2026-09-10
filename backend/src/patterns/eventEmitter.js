import EventEmitter from 'events';
import { NotificationFactory } from './notificationFactory.js';

class ReservationEventBus extends EventEmitter {}

export const eventBus = new ReservationEventBus();

// Suscriptor 1: Notificaciones al usuario (Observer activo)
eventBus.on('RESERVATION_CREATED', (data) => {
  const notification = NotificationFactory.createNotification('CONFIRMATION', data);
  console.log('\n================ NOTIFICACIÓN ENVIADA (OBSERVER) ================');
  console.log(`Para: ${notification.recipient}`);
  console.log(`Asunto: ${notification.subject}`);
  console.log(`Mensaje: ${notification.body}`);
  console.log('=================================================================\n');
});

// Suscriptor 2: Notificación por cancelación
eventBus.on('RESERVATION_CANCELLED', (data) => {
  const notification = NotificationFactory.createNotification('CANCELLATION', data);
  console.log('\n================ NOTIFICACIÓN CANCELACIÓN (OBSERVER) ============');
  console.log(`Para: ${notification.recipient}`);
  console.log(`Asunto: ${notification.subject}`);
  console.log(`Mensaje: ${notification.body}`);
  console.log('=================================================================\n');
});