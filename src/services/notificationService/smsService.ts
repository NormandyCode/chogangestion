import { toast } from 'react-hot-toast';
import { Order } from '../../types';
import { FREE_MOBILE_CONFIG } from './config';
import { generateSMSTemplate } from './templates';

export async function sendSMS(order: Order): Promise<void> {
  try {
    const message = generateSMSTemplate(order);
    const encodedMessage = encodeURIComponent(message);

    const url = `${FREE_MOBILE_CONFIG.API_URL}?user=${FREE_MOBILE_CONFIG.USER}&pass=${FREE_MOBILE_CONFIG.API_KEY}&msg=${encodedMessage}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    toast.success('SMS envoyé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi du SMS:', error);
    toast.error('Échec de l\'envoi du SMS');
    throw error;
  }
}