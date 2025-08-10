import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'https://esm.sh/resend@0.16.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const generateOrderConfirmationHTML = (templateData: any) => {
  const { customerName, orderNumber, products, totalAmount, date } = templateData;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de commande</title>
      </head>
      <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Bonjour ${customerName},</h2>
          <p>Nous avons bien reçu votre commande n°${orderNumber} du ${date}.</p>
          
          <h3>Détails de votre commande :</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Produit</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Référence</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(p => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${p.name}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${p.reference}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <p style="font-size: 18px; font-weight: bold;">
            Total : ${totalAmount} €
          </p>
          
          <p>Nous vous contacterons prochainement pour convenir d'une date de livraison qui vous conviendra.</p>
          
          <p style="margin-top: 30px;">Merci de votre confiance !</p>
        </div>
      </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, templateData } = await req.json();

    if (!to || !subject || !templateData) {
      return new Response(
        JSON.stringify({ success: false, message: 'Données email incomplètes' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

    const html = generateOrderConfirmationHTML(templateData);

    const { data, error } = await resend.emails.send({
      from: 'Gestion des Commandes <orders@votredomaine.com>',
      to,
      subject,
      html
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});