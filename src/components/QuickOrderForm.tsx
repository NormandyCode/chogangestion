import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Zap, User, MapPin, Phone, Mail, Package, Euro, Calendar, Clock, Calculator } from 'lucide-react';
import { Order, Product } from '../types';
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber';

interface QuickOrderFormProps {
  onSubmit: (order: Order) => void;
  onClose: () => void;
}

export default function QuickOrderForm({ onSubmit, onClose }: QuickOrderFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [productName, setProductName] = useState('');
  const [productRef, setProductRef] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickFillMode, setQuickFillMode] = useState(false);

  // Données de remplissage rapide
  const quickFillData = {
    clients: [
      { name: 'Jean Dupont', address: '123 rue de la Paix, Paris', phone: '06 12 34 56 78', email: 'jean@example.com' },
      { name: 'Marie Martin', address: '456 avenue des Champs, Lyon', phone: '06 98 76 54 32', email: 'marie@example.com' },
      { name: 'Pierre Durand', address: '789 boulevard Saint-Germain, Marseille', phone: '06 11 22 33 44', email: 'pierre@example.com' }
    ],
    products: [
      { name: 'Parfum Homme', ref: 'PH001', brand: 'Chanel' },
      { name: 'Parfum Femme', ref: 'PF001', brand: 'Dior' },
      { name: 'Eau de Toilette', ref: 'EDT001', brand: 'Hermès' }
    ]
  };

  const fillQuickClient = (client: any) => {
    setCustomerName(client.name);
    setAddress(client.address);
    setPhone(client.phone);
    setEmail(client.email);
    toast.success('Client rempli automatiquement');
  };

  const fillQuickProduct = (product: any) => {
    setProductName(product.name);
    setProductRef(product.ref);
    setProductBrand(product.brand);
    toast.success('Produit rempli automatiquement');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !address || !productName || !productRef || !totalAmount) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const invoiceNumber = await generateInvoiceNumber();
      
      const order: Order = {
        id: Date.now().toString(),
        customerName,
        address,
        phone: phone || undefined,
        email: email || undefined,
        products: [{ 
          name: productName, 
          reference: productRef,
          parfumBrand: productBrand || undefined
        }],
        invoiceNumber,
        totalAmount: parseFloat(totalAmount),
        date: new Date().toISOString().split('T')[0],
        isPaid: false,
        status: 'ordered'
      };

      onSubmit(order);
      toast.success('Commande rapide créée !');
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Zap className="h-6 w-6 mr-2 text-yellow-500" />
              Commande Rapide
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Mode remplissage rapide */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setQuickFillMode(!quickFillMode)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
            >
              <Zap className="h-4 w-4 mr-1" />
              {quickFillMode ? 'Masquer' : 'Afficher'} le remplissage rapide
            </button>
          </div>

          {quickFillMode && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-3">Remplissage rapide</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">Clients types :</h5>
                  <div className="space-y-1">
                    {quickFillData.clients.map((client, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => fillQuickClient(client)}
                        className="block w-full text-left text-xs p-2 bg-white dark:bg-slate-700 rounded border hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors"
                      >
                        {client.name} - {client.address.split(',')[0]}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">Produits types :</h5>
                  <div className="space-y-1">
                    {quickFillData.products.map((product, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => fillQuickProduct(product)}
                        className="block w-full text-left text-xs p-2 bg-white dark:bg-slate-700 rounded border hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors"
                      >
                        {product.name} ({product.ref}) - {product.brand}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <User className="h-4 w-4 inline mr-1" />
                  Nom client *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Jean Dupont"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Adresse *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  placeholder="123 rue Example, Paris"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  placeholder="jean@example.com"
                />
              </div>
            </div>


            {/* Produit */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                <Package className="h-5 w-5 inline mr-2" />
                Produit principal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                    placeholder="Nom du produit"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Référence *
                  </label>
                  <input
                    type="text"
                    value={productRef}
                    onChange={(e) => setProductRef(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                    placeholder="REF-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span className="inline-flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      Marque parfum
                    </span>
                  </label>
                  <input
                    type="text"
                    value={productBrand}
                    onChange={(e) => setProductBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                    placeholder="Ex: Chanel, Dior..."
                  />
                </div>
              </div>
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Euro className="h-4 w-4 inline mr-1" />
                Montant total *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
                <button
                  type="button"
                  onClick={() => setTotalAmount('35.00')}
                  className="absolute inset-y-0 right-12 flex items-center pr-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Montant standard 35€"
                >
                  <Calculator className="h-4 w-4" />
                </button>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">€</span>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Créer rapidement
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}