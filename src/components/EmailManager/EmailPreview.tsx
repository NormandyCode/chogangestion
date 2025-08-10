import React from 'react';
import { Eye, Mail } from 'lucide-react';
import { Order } from '../../types';
import { EmailTemplate } from '../../services/emailService';

interface EmailPreviewProps {
  template: EmailTemplate;
  sampleOrder?: Order;
}

export default function EmailPreview({ template, sampleOrder }: EmailPreviewProps) {
  if (!sampleOrder) {
    return (
      <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6 text-center">
        <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          Aucune commande avec email disponible pour l'aperçu
        </p>
      </div>
    );
  }

  // Remplacer les variables dans le template
  const productsList = sampleOrder.products
    .map(p => `- ${p.name} (Réf: ${p.reference})${p.parfumBrand ? ` - ${p.parfumBrand}` : ''}`)
    .join('\n');

  const paymentStatus = sampleOrder.isPaid 
    ? `Payée (${getPaymentMethodLabel(sampleOrder.paymentMethod)})`
    : 'En attente de paiement';

  const previewSubject = template.subject
    .replace(/{{customerName}}/g, sampleOrder.customerName)
    .replace(/{{orderNumber}}/g, sampleOrder.invoiceNumber)
    .replace(/{{orderDate}}/g, new Date(sampleOrder.date).toLocaleDateString('fr-FR'))
    .replace(/{{totalAmount}}/g, sampleOrder.totalAmount.toFixed(2))
    .replace(/{{paymentStatus}}/g, paymentStatus);

  const previewMessage = template.message
    .replace(/{{customerName}}/g, sampleOrder.customerName)
    .replace(/{{orderNumber}}/g, sampleOrder.invoiceNumber)
    .replace(/{{orderDate}}/g, new Date(sampleOrder.date).toLocaleDateString('fr-FR'))
    .replace(/{{productsList}}/g, productsList)
    .replace(/{{totalAmount}}/g, sampleOrder.totalAmount.toFixed(2))
    .replace(/{{paymentStatus}}/g, paymentStatus);

  function getPaymentMethodLabel(method?: string): string {
    switch (method) {
      case 'card': return 'Carte bancaire';
      case 'check': return 'Chèque';
      case 'cash': return 'Espèces';
      case 'transfer': return 'Virement';
      default: return 'Non spécifié';
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
        <Eye className="h-5 w-5 mr-2 text-green-600" />
        Aperçu de l'email
      </h3>

      <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
        {/* En-tête email */}
        <div className="bg-gray-50 dark:bg-slate-600 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium">De:</span>
              <span>L'Atelier de Mickael &lt;contact@latelierdemickael.fr&gt;</span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium">À:</span>
              <span>{sampleOrder.customerName} &lt;{sampleOrder.email}&gt;</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Sujet:</span>
              <span className="font-medium text-gray-900 dark:text-white">{previewSubject}</span>
            </div>
          </div>
        </div>

        {/* Corps de l'email */}
        <div className="p-4">
          <div
            className="text-sm text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: previewMessage }}
          />
        </div>
      </div>

      {/* Informations sur l'exemple */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="text-xs text-blue-800 dark:text-blue-200">
          <div className="font-medium mb-1">Aperçu basé sur :</div>
          <div>• Client : {sampleOrder.customerName}</div>
          <div>• Commande : {sampleOrder.invoiceNumber}</div>
          <div>• Email : {sampleOrder.email}</div>
        </div>
      </div>
    </div>
  );
}
