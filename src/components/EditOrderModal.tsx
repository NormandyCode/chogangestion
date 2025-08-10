import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { X, Save, User, MapPin, Phone, Mail, Package, Euro, Calendar, CreditCard } from 'lucide-react';
import { Order, Product, PaymentMethod } from '../types';
import ProductInput from './ProductInput';

interface EditOrderModalProps {
  order: Order;
  onClose: () => void;
  onSave: (updatedOrder: Order) => void;
}

export default function EditOrderModal({ order, onClose, onSave }: EditOrderModalProps) {
  const [customerName, setCustomerName] = useState(order.customerName);
  const [address, setAddress] = useState(order.address);
  const [phone, setPhone] = useState(order.phone || '');
  const [email, setEmail] = useState(order.email || '');
  const [products, setProducts] = useState<Product[]>(order.products);
  const [invoiceNumber, setInvoiceNumber] = useState(order.invoiceNumber);
  const [totalAmount, setTotalAmount] = useState(order.totalAmount.toString());
  const [date, setDate] = useState(order.date);
  const [isPaid, setIsPaid] = useState(order.isPaid);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(order.paymentMethod || '');
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !address || !invoiceNumber || !totalAmount || !date) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (products.length === 0) {
      toast.error('Veuillez ajouter au moins un produit');
      return;
    }

    if (products.some(p => !p.name || !p.reference)) {
      toast.error('Veuillez remplir tous les champs des produits');
      return;
    }

    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Format d\'email invalide');
      return;
    }

    if (isPaid && !paymentMethod) {
      toast.error('Veuillez sélectionner un mode de paiement');
      return;
    }

    setSaving(true);
    try {
      const updatedOrder: Order = {
        ...order,
        customerName,
        address,
        phone: phone || undefined,
        email: email || undefined,
        products,
        invoiceNumber,
        totalAmount: parseFloat(totalAmount),
        date,
        isPaid,
        paymentMethod: isPaid ? paymentMethod as PaymentMethod : undefined,
        status
      };

      console.log('📝 Données de la commande modifiée:', {
        id: updatedOrder.id,
        customerName: updatedOrder.customerName,
        products: updatedOrder.products,
        invoiceNumber: updatedOrder.invoiceNumber,
        totalAmount: updatedOrder.totalAmount
      });

      await onSave(updatedOrder);
      console.log('✅ onSave terminé, fermeture de la modal...');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast.error('Erreur lors de la modification de la commande');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Package className="h-6 w-6 mr-3 text-indigo-600" />
              Modifier la commande {order.invoiceNumber}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 text-2xl"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informations client */}
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informations client
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    Nom et Prénom *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-600 dark:text-white"
                    placeholder="Jean Dupont"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-600 dark:text-white"
                    placeholder="06 12 34 56 78"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-600 dark:text-white"
                    placeholder="123 rue Example, Paris"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-600 dark:text-white"
                    placeholder="jean.dupont@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Informations commande */}
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Informations commande
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Numéro de Facture *
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Euro className="h-4 w-4 inline mr-1" />
                    Montant Total *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      className="w-full px-3 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-600 dark:text-white"
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut de la commande
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'ordered' | 'preparing' | 'delivered')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-600 dark:text-white"
                  >
                    <option value="ordered">Commandée</option>
                    <option value="preparing">En préparation</option>
                    <option value="delivered">Livrée</option>
                  </select>
                </div>
              </div>

              {/* Paiement */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPaid}
                      onChange={(e) => {
                        setIsPaid(e.target.checked);
                        if (!e.target.checked) {
                          setPaymentMethod('');
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <CreditCard className="h-4 w-4 inline mr-1" />
                      Commande payée
                    </span>
                  </label>
                </div>

                {isPaid && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mode de paiement *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-600 dark:text-white"
                      required={isPaid}
                    >
                      <option value="">Sélectionner un mode de paiement</option>
                      <option value="card">Carte bancaire</option>
                      <option value="check">Chèque</option>
                      <option value="cash">Espèces</option>
                      <option value="transfer">Virement</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Produits */}
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Produits
              </h3>
              <ProductInput products={products} onChange={setProducts} />
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder les modifications
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}