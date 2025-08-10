import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProductInput from './ProductInput';
import { Product } from '../types';

interface AddProductsModalProps {
  orderId: string;
  onClose: () => void;
  onProductsAdded: () => void;
}

export default function AddProductsModal({ orderId, onClose, onProductsAdded }: AddProductsModalProps) {
  const [products, setProducts] = useState<Product[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (products.length === 0) {
      toast.error('Veuillez ajouter au moins un produit');
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'ajout des produits');

      toast.success('Produits ajoutés avec succès');
      onProductsAdded();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'ajout des produits');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Ajouter des produits
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <ProductInput products={products} onChange={setProducts} />

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}