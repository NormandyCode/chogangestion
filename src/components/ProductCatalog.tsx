import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Package, Plus, Edit, Trash2, Search, Filter, Star, Archive, Download, Upload, BarChart3, X } from 'lucide-react';
import { supabase } from '../db/config';

interface Product {
  id: string;
  nom: string;
  reference: string;
  parfum_brand?: string;
  created_at: string;
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    reference: '',
    parfum_brand: ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('produits')
        .select('*')
        .order('nom');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      
      if (editingProduct) {
        console.log('🔄 Modification du produit:', editingProduct.id, formData);
        
        const { data: updateResult, error } = await supabase
          .from('produits')
          .update(formData)
          .eq('id', editingProduct.id)
          .select();
        
        if (error) {
          console.error('❌ Erreur Supabase lors de la mise à jour:', error);
          throw error;
        }
        
        console.log('🔍 Résultat de la mise à jour:', updateResult);
        
        if (!updateResult || updateResult.length === 0) {
          console.error('❌ Aucun produit mis à jour - problème RLS probable');
          throw new Error('Impossible de modifier le produit. Vérifiez les permissions.');
        }
        
        console.log('✅ Produit vraiment mis à jour:', updateResult[0]);
        console.log('✅ Produit modifié, mise à jour des commandes...');
        
        const event = new CustomEvent('refreshOrders');
        window.dispatchEvent(event);
        
        toast.success('Produit modifié !');
      } else {
        const { data: insertResult, error } = await supabase
          .from('produits')
          .insert(formData)
          .select();
        
        if (error) {
          console.error('❌ Erreur Supabase lors de l\'ajout:', error);
          throw error;
        }
        
        console.log('✅ Nouveau produit créé:', insertResult);
        toast.success('Produit ajouté !');
      }
      
      setFormData({ nom: '', reference: '', parfum_brand: '' });
      setShowForm(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error: any) {
      console.error('Erreur modification produit:', error);
      toast.error(`Erreur: ${error.message || 'Sauvegarde impossible'}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      nom: product.nom,
      reference: product.reference,
      parfum_brand: product.parfum_brand || ''
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    
    try {
      console.log('🗑️ Suppression du produit:', productId);
      
      const { data: existingProduct, error: checkError } = await supabase
        .from('produits')
        .select('id, nom, reference')
        .eq('id', productId)
        .single();
      
      if (checkError) {
        console.error('❌ Erreur vérification existence:', checkError);
        throw new Error(`Produit introuvable: ${checkError.message}`);
      }
      
      console.log('✅ Produit trouvé:', existingProduct);
      
      const { data: linkedOrders, error: linkError } = await supabase
        .from('commande_produits')
        .select('commande_id')
        .eq('produit_id', productId);
      
      if (linkError) {
        console.error('❌ Erreur vérification liens:', linkError);
        throw new Error(`Erreur vérification liens: ${linkError.message}`);
      }
      
      if (linkedOrders && linkedOrders.length > 0) {
        console.log('⚠️ Produit lié à des commandes:', linkedOrders.length);
        if (!confirm(`Ce produit est utilisé dans ${linkedOrders.length} commande(s). Voulez-vous vraiment le supprimer ?`)) {
          return;
        }
      }
      
      console.log('🗑️ Tentative de suppression du produit:', productId);
      const { data: deleteResult, error } = await supabase
        .from('produits')
        .delete()
        .eq('id', productId)
        .select();
      
      if (error) {
        console.error('❌ Erreur suppression:', error);
        throw new Error(`Erreur suppression: ${error.message} (Code: ${error.code})`);
      }
      
      console.log('🔍 Résultat de la suppression:', deleteResult);
      
      if (!deleteResult || deleteResult.length === 0) {
        console.error('❌ Aucun produit supprimé - problème RLS probable');
        throw new Error('Impossible de supprimer le produit. Vérifiez les permissions.');
      }
      
      console.log('✅ Produit supprimé avec succès:', deleteResult);
      toast.success('Produit supprimé !');
      loadProducts();
    } catch (error: any) {
      console.error('💥 Erreur complète suppression:', error);
      toast.error(`Erreur: ${error.message || 'Suppression impossible'}`);
    }
  };

  const exportProducts = () => {
    const csv = [
      'Nom,Référence,Marque',
      ...products.map(p => `"${p.nom}","${p.reference}","${p.parfum_brand || ''}"`)
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'catalogue-produits.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Catalogue exporté !');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = !brandFilter || product.parfum_brand === brandFilter;
    return matchesSearch && matchesBrand;
  });

  const brands = [...new Set(products.map(p => p.parfum_brand).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Chargement des produits...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Package className="h-6 w-6 mr-3" />
              Catalogue Produits
            </h2>
            <p className="mt-1 opacity-90">Gérez votre catalogue de produits</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportProducts}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
            >
              <Download className="h-4 w-4 mr-2 inline" />
              Exporter CSV
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Nouveau produit
            </button>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{products.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Produits total</div>
            </div>
            <Package className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-indigo-600">{brands.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Marques</div>
            </div>
            <Star className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{filteredProducts.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Résultats</div>
            </div>
            <Search className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {products.filter(p => p.parfum_brand).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avec marque</div>
            </div>
            <BarChart3 className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="">Toutes les marques</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2 text-purple-600" />
            {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  placeholder="Nom du produit"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Référence *
                </label>
                <input
                  type="text"
                  placeholder="Référence"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Marque parfum
                </label>
                <input
                  type="text"
                  placeholder="Ex: Chanel, Dior..."
                  value={formData.parfum_brand}
                  onChange={(e) => setFormData({ ...formData, parfum_brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
              >
                {updating ? 'Sauvegarde...' : (editingProduct ? 'Modifier' : 'Ajouter')}
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  setFormData({ nom: '', reference: '', parfum_brand: '' });
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des produits */}
      <div className="grid gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedProduct(product)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      {product.nom}
                    </h4>
                    {product.parfum_brand && (
                      <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-full text-xs font-bold shadow-sm">
                        {product.parfum_brand}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <Package className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="font-mono bg-gray-100 dark:bg-slate-600 px-2 py-1 rounded">
                      {product.reference}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Créé le {new Date(product.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(product);
                    }}
                    className="p-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Modifier ce produit"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(product.id);
                    }}
                    className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Supprimer ce produit"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
          <Package className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {products.length === 0 ? 'Aucun produit trouvé' : 'Aucun résultat'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {products.length === 0 ? 'Commencez par ajouter des produits' : 'Essayez de modifier vos critères de recherche'}
          </p>
        </div>
      )}

      {/* Modal détails produit */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                    <Package className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedProduct.nom}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Référence : {selectedProduct.reference}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Informations du produit
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Nom</div>
                      <div className="font-medium text-gray-900 dark:text-white">{selectedProduct.nom}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Référence</div>
                      <div className="font-mono bg-gray-100 dark:bg-slate-600 px-2 py-1 rounded text-gray-900 dark:text-white">
                        {selectedProduct.reference}
                      </div>
                    </div>
                    {selectedProduct.parfum_brand && (
                      <div className="md:col-span-2">
                        <div className="text-gray-500 dark:text-gray-400">Marque parfum</div>
                        <div className="font-medium text-purple-600 dark:text-purple-400">
                          {selectedProduct.parfum_brand}
                        </div>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <div className="text-gray-500 dark:text-gray-400">Date de création</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedProduct.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      handleEdit(selectedProduct);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Edit className="h-4 w-4 mr-2 inline" />
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      handleDelete(selectedProduct.id);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Trash2 className="h-4 w-4 mr-2 inline" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}