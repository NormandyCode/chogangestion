import * as XLSX from 'xlsx';
import { Order } from '../types';

export function generateExcelFromOrders(orders: Order[]) {
  if (orders.length === 0) {
    throw new Error('Aucune commande sélectionnée');
  }

  // Créer un tableau avec nom, code et marque des parfums
  const productsData: any[] = [];
  
  orders.forEach((order) => {
    order.products.forEach((product) => {
      productsData.push({
        'Nom du produit': product.name,
        'Code/Référence': product.reference,
        'Marque des parfums': product.parfumBrand || 'Non spécifiée'
      });
    });
  });

  // Créer le workbook avec une seule feuille
  const workbook = XLSX.utils.book_new();

  // Feuille unique: Liste complète avec marque des parfums
  const worksheet = XLSX.utils.json_to_sheet(productsData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Produits commandés');

  // Générer le nom du fichier
  const fileName = orders.length === 1 
    ? `produits-${orders[0].invoiceNumber}.xlsx`
    : `produits-export-${orders.length}-commandes.xlsx`;

  // Sauvegarder le fichier
  XLSX.writeFile(workbook, fileName);
}