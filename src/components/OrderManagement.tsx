import React, { useState, useEffect } from 'react';
import { PackageSearch, Plus, Settings, LogOut, User, Zap, BarChart3, FileText, X, Archive, Download, Mail, Phone, MapPin, Star, Truck, ExternalLink, Package } from 'lucide-react';
import OrderForm from './OrderForm';
import OrderList from './OrderList';
import DownloadButtons from './DownloadButtons';
import AdminPanel from './AdminPanel';
import ThemeToggle from './ThemeToggle';
import QuickOrderForm from './QuickOrderForm';
import StatsPanel from './StatsPanel';
import ProductCatalog from './ProductCatalog';
import ClientManager from './ClientManager';
import ReportsGenerator from './ReportsGenerator';
import BackupManager from './BackupManager';
import EmailManager from './EmailManager';
import { Order, PaymentMethod } from '../types';
import { saveOrder, getOrders, deleteOrder, updateOrderPaymentStatus, updateOrderStatus, updateOrder } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showProductCatalog, setShowProductCatalog] = useState(false);
  const [showClientManager, setShowClientManager] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [showEmailManager, setShowEmailManager] = useState(false);
  const [selectedOrdersForEmail, setSelectedOrdersForEmail] = useState<string[]>([]);
  const { user, signOut } = useAuth();

  const isAdmin = user?.email === 'lbmickael@icloud.com';

  useEffect(() => {
    loadOrders();
    
    // Écouter l'événement d'ouverture du gestionnaire d'email
    const handleOpenEmailManager = (event: CustomEvent) => {
      setSelectedOrdersForEmail(event.detail.selectedOrders);
      setShowEmailManager(true);
    };
    
    // Écouter l'événement de rafraîchissement des commandes
    const handleRefreshOrders = () => {
      loadOrders();
    };
    
    window.addEventListener('openEmailManager', handleOpenEmailManager as EventListener);
    window.addEventListener('refreshOrders', handleRefreshOrders as EventListener);
    
    return () => {
      window.removeEventListener('openEmailManager', handleOpenEmailManager as EventListener);
      window.removeEventListener('refreshOrders', handleRefreshOrders as EventListener);
    };
  }, []);

  const loadOrders = async () => {
    try {
      const loadedOrders = await getOrders();
      setOrders(loadedOrders);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    }
  };

  const handleAddOrder = async (order: Order) => {
    try {
      await saveOrder(order);
      await loadOrders();
      setShowForm(false);
      toast.success('Commande ajoutée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la commande:', error);
      
      // Vérifier si c'est une erreur de contrainte unique sur le numéro de facture
      if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint "commandes_numero_facture_key"')) {
        toast.error('Erreur: Un numéro de facture identique existe déjà. Veuillez réessayer.');
      } else {
        toast.error('Erreur lors de l\'ajout de la commande');
      }
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id);
      await loadOrders();
      toast.success('Commande supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la commande');
    }
  };

  const handleTogglePayment = async (id: string, method: PaymentMethod) => {
    try {
      await updateOrderPaymentStatus(id, true, method);
      await loadOrders();
      toast.success('Statut de paiement mis à jour');
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast.error('Erreur lors de la mise à jour du statut de paiement');
    }
  };

  const handleUpdateStatus = async (id: string, status: 'ordered' | 'preparing' | 'delivered') => {
    try {
      await updateOrderStatus(id, status);
      await loadOrders();
      toast.success('Statut de commande mis à jour');
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    try {
      console.log('🔄 Début modification commande:', updatedOrder.id);
      await updateOrder(updatedOrder);
      console.log('✅ Modification terminée, rechargement des commandes...');
      await loadOrders();
      console.log('✅ Commandes rechargées');
      toast.success('Commande modifiée avec succès');
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast.error('Erreur lors de la modification de la commande');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const paidOrders = orders.filter(order => order.isPaid).length;
  const unpaidOrders = totalOrders - paidOrders;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-[90rem] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <User className="h-4 w-4" />
              <span>{user?.full_name || user?.email}</span>
            </div>
            <ThemeToggle />
            <a
              href="https://latelierdemickael.fr/etiquettes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Étiquettes
            </a>
            {isAdmin && (
              <button
                onClick={() => setShowStatsPanel(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Statistiques
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
              >
                <Settings className="h-5 w-5 mr-2" />
                {showAdmin ? 'Fermer Admin' : 'Administration'}
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Titre principal */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg">
              <PackageSearch className="h-12 w-12 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Gestion des Commandes
              </h1>
              <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                Gérez vos commandes en toute simplicité
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Commandes</p>
                <p className="text-3xl font-bold">{totalOrders}</p>
              </div>
              <PackageSearch className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Chiffre d'Affaires</p>
                <p className="text-3xl font-bold">{totalRevenue.toFixed(0)}€</p>
              </div>
              <FileText className="h-12 w-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Commandes Payées</p>
                <p className="text-3xl font-bold">{paidOrders}</p>
                <p className="text-emerald-100 text-sm">
                  {totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(1) : 0}% du total
                </p>
              </div>
              <Settings className="h-12 w-12 text-emerald-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">En Attente</p>
                <p className="text-3xl font-bold">{unpaidOrders}</p>
                <p className="text-orange-100 text-sm">
                  {totalOrders > 0 ? ((unpaidOrders / totalOrders) * 100).toFixed(1) : 0}% du total
                </p>
              </div>
              <User className="h-12 w-12 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Panneaux admin et SMS */}
        {showAdmin && isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Administration</h2>
                  <button
                    onClick={() => setShowAdmin(false)}
                    className="text-gray-400 hover:text-gray-500 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <AdminPanel />
              </div>
            </div>
          </div>
        )}

        {showProductCatalog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Catalogue Produits</h2>
                  <button
                    onClick={() => setShowProductCatalog(false)}
                    className="text-gray-400 hover:text-gray-500 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <ProductCatalog />
              </div>
            </div>
          </div>
        )}

        {showClientManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion Clients</h2>
                  <button
                    onClick={() => setShowClientManager(false)}
                    className="text-gray-400 hover:text-gray-500 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <ClientManager orders={orders} />
              </div>
            </div>
          </div>
        )}

        {showReports && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rapports Avancés</h2>
                  <button
                    onClick={() => setShowReports(false)}
                    className="text-gray-400 hover:text-gray-500 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <ReportsGenerator orders={orders} />
              </div>
            </div>
          </div>
        )}

        {showBackup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sauvegarde & Import</h2>
                  <button
                    onClick={() => setShowBackup(false)}
                    className="text-gray-400 hover:text-gray-500 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <BackupManager orders={orders} />
              </div>
            </div>
          </div>
        )}

        {showEmailManager && (
          <EmailManager
            orders={orders}
            selectedOrders={selectedOrdersForEmail}
            onClose={() => {
              setShowEmailManager(false);
              setSelectedOrdersForEmail([]);
            }}
          />
        )}

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sticky top-8">
              <DownloadButtons />
              
              <button
                onClick={() => setShowProductCatalog(!showProductCatalog)}
                className="w-full mt-4 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
              >
                <Archive className="h-5 w-5 mr-2" />
                {showProductCatalog ? 'Fermer' : 'Catalogue produits'}
              </button>
              
              <button
                onClick={() => setShowClientManager(!showClientManager)}
                className="w-full mt-4 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200"
              >
                <User className="h-5 w-5 mr-2" />
                {showClientManager ? 'Fermer' : 'Gestion clients'}
              </button>
              
              <button
                onClick={() => setShowReports(!showReports)}
                className="w-full mt-4 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
              >
                <FileText className="h-5 w-5 mr-2" />
                {showReports ? 'Fermer' : 'Rapports avancés'}
              </button>
              
              <button
                onClick={() => setShowBackup(!showBackup)}
                className="w-full mt-4 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                <Download className="h-5 w-5 mr-2" />
                {showBackup ? 'Fermer' : 'Sauvegarde/Import'}
              </button>
              
              <button
                onClick={() => setShowEmailManager(!showEmailManager)}
                className="w-full mt-4 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Mail className="h-5 w-5 mr-2" />
                {showEmailManager ? 'Fermer' : 'Gestion Email'}
              </button>
              
              <button
                onClick={() => setShowQuickForm(true)}
                className="w-full mt-4 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200"
              >
                <Zap className="h-5 w-5 mr-2" />
                Commande rapide
              </button>
              
              <button
                onClick={() => setShowForm(!showForm)}
                className="w-full mt-4 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                {showForm ? 'Fermer' : 'Nouvelle commande'}
              </button>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-9">
            {showForm && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8 transition-all duration-300 ease-in-out">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Nouvelle Commande
                </h2>
                <OrderForm onSubmit={handleAddOrder} />
              </div>
            )}

            {!showAdmin && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                <OrderList
                  orders={orders}
                  onDelete={handleDeleteOrder}
                  onTogglePayment={handleTogglePayment}
                  onUpdateStatus={handleUpdateStatus}
                  onUpdateOrder={handleUpdateOrder}
                />
              </div>
            )}
          </div>
        </div>

        {/* Modales */}
        {showQuickForm && (
          <QuickOrderForm
            onSubmit={handleAddOrder}
            onClose={() => setShowQuickForm(false)}
          />
        )}

        {showStatsPanel && (
          <StatsPanel
            orders={orders}
            onClose={() => setShowStatsPanel(false)}
          />
        )}

        {/* Pied de page - Carte de visite */}
        <footer className="mt-16 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Logo et informations */}
                <div className="text-center lg:text-left">
                  <div className="flex justify-center lg:justify-start items-center mb-6">
                    <div className="bg-white rounded-full p-4 shadow-lg mr-4">
                      <img 
                        src="/logo.png" 
                        alt="L'Atelier de Mickael" 
                        className="h-16 w-16 object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        L'Atelier de Mickael
                      </h3>
                      <p className="text-slate-300 text-lg">
                        Création de parfums personnalisés
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-slate-300">
                    <div className="flex items-center justify-center lg:justify-start space-x-3">
                      <Mail className="h-5 w-5 text-blue-400" />
                      <a 
                        href="mailto:lbmickael@icloud.com" 
                        className="hover:text-blue-400 transition-colors duration-200"
                      >
                        lbmickael@icloud.com
                      </a>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start space-x-3">
                      <Phone className="h-5 w-5 text-green-400" />
                      <a 
                        href="tel:0633264292" 
                        className="hover:text-green-400 transition-colors duration-200"
                      >
                        06-33-26-42-92
                      </a>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start space-x-3">
                      <MapPin className="h-5 w-5 text-red-400" />
                      <span>France</span>
                    </div>
                  </div>
                </div>

                {/* Services et liens */}
                <div className="text-center lg:text-right">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <h4 className="text-xl font-semibold text-white mb-4">
                      Nos Services
                    </h4>
                    <div className="space-y-2 text-slate-300">
                      <div className="flex items-center justify-center lg:justify-end space-x-2">
                        <Package className="h-4 w-4 text-purple-400" />
                        <span>Parfums sur mesure</span>
                      </div>
                      <div className="flex items-center justify-center lg:justify-end space-x-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>Créations exclusives</span>
                      </div>
                      <div className="flex items-center justify-center lg:justify-end space-x-2">
                        <Truck className="h-4 w-4 text-blue-400" />
                        <span>Livraison personnalisée</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-white/20">
                      <a
                        href="https://latelierdemickael.fr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visitez notre site
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Copyright */}
              <div className="mt-8 pt-6 border-t border-slate-700 text-center">
                <p className="text-slate-400 text-sm">
                  © 2024 L'Atelier de Mickael - Tous droits réservés
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Système de gestion des commandes - Version 2.0
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}