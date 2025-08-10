import { Order } from '../../types';
import { sendSMS } from './smsService';
import { sendEmail } from './emailService';

export async function sendOrderConfirmation(order: Order) {
  const notifications = [];

  if (order.email) {
    notifications.push(sendEmail(order));
  }
  
  // Toujours envoyer un SMS au propriétaire
  notifications.push(sendSMS(order));

  try {
    await Promise.all(notifications);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
    // Les erreurs individuelles sont déjà gérées dans chaque service
  }
}

export { sendEmail, sendSMS };