import { supabase } from '../db/config';

export async function generateInvoiceNumber(): Promise<string> {
  try {
    // Get the last invoice number without user filtering
    const { data: lastOrder, error } = await supabase
      .from('commandes')
      .select('numero_facture')
      .order('numero_facture', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    let nextNumber = 1;
    
    if (lastOrder) {
      // Extract the number from the last invoice
      const lastNumber = parseInt(lastOrder.numero_facture);
      nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
    }

    // Format the number with leading zeros (8 digits)
    return nextNumber.toString().padStart(3, '0');
  } catch (error) {
    console.error('Erreur lors de la génération du numéro de facture:', error);
    throw error;
  }
}