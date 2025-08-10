import { Order } from '../../types';

export function generateSMSTemplate(order: Order): string {
  return `
Nouvelle commande reçue !

Client: ${order.customerName}
N° Facture: ${order.invoiceNumber}
Produits:
${order.products.map(p => `- ${p.name} (${p.reference})`).join('\n')}

Total: ${order.totalAmount.toFixed(2)}€

Quand souhaitez-vous que nous vous livrions votre commande ?
`.trim();
}

export function generateEmailTemplate(order: Order): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Bonjour ${order.customerName},</h2>
      
      <p>Nous avons bien reçu votre commande n°${order.invoiceNumber}.</p>
      
      <h3>Détails de votre commande :</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Produit</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Référence</th>
          </tr>
        </thead>
        <tbody>
          ${order.products.map(p => `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${p.name}</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${p.reference}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <p style="font-size: 18px; font-weight: bold;">
        Total : ${order.totalAmount.toFixed(2)} €
      </p>
      
      <p>Nous vous contacterons prochainement pour convenir d'une date de livraison qui vous conviendra.</p>
      
      <p style="margin-top: 30px;">Merci de votre confiance !</p>
    </div>
  `;
}