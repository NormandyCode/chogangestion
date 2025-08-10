import React from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { Product } from '../types';

interface ProductInputProps {
  products: Product[];
  onChange: (products: Product[]) => void;
}

export default function ProductInput({ products, onChange }: ProductInputProps) {
  const addProduct = () => {
    onChange([...products, { name: '', reference: '', parfumBrand: '' }]);
  };

  const removeProduct = (index: number) => {
    onChange(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof Product, value: string) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    onChange(newProducts);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Produits</label>
        <button
          type="button"
          onClick={addProduct}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </button>
      </div>

      <div className="space-y-3">
        {products.map((product, index) => (
          <div
            key={index}
            className="flex gap-4 p-4 bg-gray-50 rounded-lg items-center transition-all duration-200 hover:shadow-md"
          >
            <Package className="h-5 w-5 text-gray-400" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nom du produit"
                value={product.name}
                onChange={(e) => updateProduct(index, 'name', e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                required
              />
              <input
                type="text"
                placeholder="Référence"
                value={product.reference}
                onChange={(e) => updateProduct(index, 'reference', e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                required
              />
              <input
                type="text"
                placeholder="Marque (ex: Chanel, Dior...)"
                value={product.parfumBrand || ''}
                onChange={(e) => updateProduct(index, 'parfumBrand', e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
              />
            </div>
            <button
              type="button"
              onClick={() => removeProduct(index)}
              className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50 transition-colors duration-200"
              title="Supprimer le produit"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Aucun produit ajouté. Cliquez sur "Ajouter un produit" pour commencer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}