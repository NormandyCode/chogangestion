import React, { useState } from 'react';
import { Plus, Mail, X } from 'lucide-react';
import { Order } from '../types';
import AddProductsModal from './AddProductsModal';
import { sendOrderConfirmationEmail } from '../services/notificationService';
import { toast } from 'react-hot-toast';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onRefresh: () => void;
}

export default function OrderDetails({ order, onClose, onRefresh }: OrderDetailsProps) {
  const [showAddProducts, setShowAddProducts] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendEmail = async () => {
    if (!order.email) {
      toast.error('Aucune adresse email pour ce client');
      return;
    }

    try {
      setSendingEmail(true);
      await sendOrderConfirmationEmail(order);
      toast.success('Email de confirmation envoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setSendingEmail(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Détails de la commande
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Informations client
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nom</p>
                  <p className="mt-1">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Adresse</p>
                  <p className="mt-1">{order.address}</p>
                </div>
                {order.email && (
                  <div className="col-span-2 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1">{order.email}</p>
                    </div>
                    <button
                      onClick={handleSendEmail}
                      disabled={sendingEmail}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {sendingEmail ? 'Envoi en cours...' : 'Envoyer email'}
                    </button>
                  </div>
                )}
                {order.phone && (
                  <div className="col-span-2 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Téléphone</p>
                      <p className="mt-1">{order.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Produits
                </h3>
                <button
                  onClick={() => setShowAddProducts(true)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter des produits
                </button>
              </div>
              <div className="space-y-2">
                {order.products.map((product, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-gray-500">{product.reference}</span>
                    </div>
                    {product.parfumBrand && (
                      <div className="flex items-center text-sm text-purple-600">
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        {product.parfumBrand}
                      </div>
                    )}
                  </div>
                ))}
                {order.products.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Aucun produit dans cette commande
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">N° Facture</p>
                <p className="mt-1">{order.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p className="mt-1">
                  {new Date(order.date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Montant total</p>
                <p className="mt-1">{order.totalAmount.toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Statut paiement</p>
                <p className="mt-1">
                  {order.isPaid ? (
                    <span className="text-green-600">
                      Payée ({order.paymentMethod})
                    </span>
                  ) : (
                    <span className="text-red-600">Non payée</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddProducts && (
        <AddProductsModal
          orderId={order.id}
          onClose={() => setShowAddProducts(false)}
          onProductsAdded={() => {
            setShowAddProducts(false);
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
}