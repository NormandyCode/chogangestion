import { toast } from 'react-hot-toast';
import { Order } from '../../types';
import { EMAIL_CONFIG } from './config';
import { generateEmailTemplate } from './templates';
import { supabase } from '../../db/config';

export async function sendEmail(order: Order): Promise<void> {
  if (!order.email) {
    toast.error('Email du client manquant');
    return;
  }

  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: order.email,
        subject: `Confirmation de votre commande ${order.invoiceNumber}`,
        html: generateEmailTemplate(order),
        from: `${EMAIL_CONFIG.FROM_NAME} <${EMAIL_CONFIG.FROM_EMAIL}>`
      }
    });

    if (error) throw error;

    toast.success('Email envoyé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    toast.error('Échec de l\'envoi de l\'email');
    throw error;
  }
}