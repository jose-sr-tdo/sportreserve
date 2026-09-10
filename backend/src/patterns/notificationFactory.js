export class NotificationFactory {
  static createNotification(type, payload) {
    const timestamp = new Date().toISOString();

    switch (type) {
      case 'CONFIRMATION':
        return {
          id: `NOTIF-${Date.now()}`,
          type: 'CONFIRMATION',
          recipient: payload.userEmail,
          subject: '¡Reserva Confirmada en SportReserve!',
          body: `Hola ${payload.userName}, tu reserva para el espacio "${payload.spaceName}" ha sido confirmada para la fecha ${payload.date} en el horario de ${payload.startTime} a ${payload.endTime}.`,
          timestamp
        };

      case 'CANCELLATION':
        return {
          id: `NOTIF-${Date.now()}`,
          type: 'CANCELLATION',
          recipient: payload.userEmail,
          subject: 'Cancelación de Reserva - SportReserve',
          body: `Hola ${payload.userName}, tu reserva para el espacio "${payload.spaceName}" programada para el ${payload.date} ha sido cancelada exitosamente.`,
          timestamp
        };

      default:
        throw new Error(`Tipo de notificación no soportado: ${type}`);
    }
  }
}