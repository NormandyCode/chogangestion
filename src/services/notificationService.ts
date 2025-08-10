import { toast } from 'react-hot-toast';
import { Order } from '../types';
import emailjs from '@emailjs/browser';

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  if (!order.email) {
    toast.error('Email du client manquant');
    return;
  }

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    toast.error('Configuration EmailJS manquante. Vérifiez vos variables d\'environnement.');
    console.error('EmailJS configuration missing:', {
      serviceId: !!serviceId,
      templateId: !!templateId,
      publicKey: !!publicKey
    });
    return;
  }

  try {
    // Format products for the template
    const productsText = order.products
      .map(p => `- ${p.name} (Réf: ${p.reference})`)
      .join('\n');

    // Get payment method display text
    const getPaymentMethodText = (method?: string) => {
      switch (method) {
        case 'card': return 'Carte bancaire';
        case 'check': return 'Chèque';
        case 'cash': return 'Espèces';
        case 'transfer': return 'Virement';
        default: return 'Non spécifié';
      }
    };

    const templateParams = {
      to: order.email,
      to_name: order.customerName,
      order_number: order.invoiceNumber,
      order_date: new Date(order.date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      products: productsText,
      total_amount: `${order.totalAmount.toFixed(2)} €`,
      payment_status: order.isPaid ? 'Payée' : 'Non payée',
      payment_method: getPaymentMethodText(order.paymentMethod),
      customer_address: order.address,
      customer_phone: order.phone || 'Non spécifié',
      template_id: templateId
    };

    await emailjs.init(publicKey);
    const response = await emailjs.send(serviceId, templateId, templateParams);

    if (response.status === 200) {
      toast.success('Email envoyé avec succès');
    } else {
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    toast.error(error.message || 'Erreur lors de l\'envoi de l\'email');
    throw error;
  }
}