import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ProductInput from './ProductInput';
import { Order, Product, PaymentMethod } from '../types';
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber';
import { Calculator } from 'lucide-react';


interface OrderFormProps {
  onSubmit: (order: Order) => void;
}

export default function OrderForm({ onSubmit }: OrderFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInvoiceNumber()
      .then(number => {
        setInvoiceNumber(number);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors de la génération du numéro de facture:', error);
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
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
      toast.error('Veuillez sélectionner un mode de paiement !');
      return;
    }

    const order: Order = {
      id: Date.now().toString(),
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
      status: 'ordered'
    };

    onSubmit(order);
    
    // Reset form
    setCustomerName('');
    setAddress('');
    setPhone('');
    setEmail('');
    setProducts([]);
    setTotalAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsPaid(false);
    setPaymentMethod('');

    // Generate new invoice number
    generateInvoiceNumber()
      .then(setInvoiceNumber)
      .catch(error => {
        console.error('Erreur lors de la génération du numéro de facture:', error);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom et Prénom *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
              placeholder="Jean Dupont"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adresse *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
              placeholder="123 rue Example, 75000 Paris"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Téléphone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
              placeholder="06 12 34 56 78"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
              placeholder="jean.dupont@example.com"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Numéro de Facture
            </label>
            <input
              type="text"
              value={invoiceNumber}
              className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 cursor-not-allowed"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Montant Total *
            </label>
            <div className="mt-1 relative rounded-lg shadow-sm">
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="block w-full rounded-lg border-gray-300 pl-3 pr-12 focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
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

          <div className="space-y-4">
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
                <span className="ms-3 text-sm font-medium text-gray-700">Commande payée</span>
              </label>
            </div>

            {isPaid && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mode de paiement *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
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
      </div>

      <ProductInput products={products} onChange={setProducts} />

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          Ajouter la commande
        </button>
      </div>
    </form>
  );
}