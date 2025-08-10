import React, { useState, useEffect, useRef } from 'react';
import { FileText, Trash2, CreditCard, CheckSquare, Banknote, Building2, ChevronDown, ChevronUp, Eye, PackageSearch, Edit, Copy, Filter, Search, Calendar, Euro, Phone, Mail, Package, Truck, Clock, Square, X, Download, Printer, Star, StarOff, Archive, ArchiveRestore, Calculator, TrendingUp, AlertTriangle, CheckCircle2, Clock3, Zap, RotateCcw, ExternalLink } from 'lucide-react';
import { Order, PaymentMethod } from '../types';
import OrderDetails from './OrderDetails';
import EditOrderModal from './EditOrderModal';
import { generateInvoicePDF } from '../utils/generateInvoicePDF';
import { generateBulkPDF } from '../utils/generateBulkPDF';
import { generateExcelFromOrders } from '../utils/generateExcel';
import { toast } from 'react-hot-toast';

interface OrderListProps {
  orders: Order[];
  onDelete: (id: string) => void;
  onTogglePayment: (id: string, method: PaymentMethod) => void;
  onUpdateStatus?: (id: string, status: 'ordered' | 'preparing' | 'delivered') => void;
  onUpdateOrder?: (order: Order) => void;
}

export default function OrderList({ orders, onDelete, onTogglePayment, onUpdateStatus, onUpdateOrder }: OrderListProps) {
  const [openPaymentMenu, setOpenPaymentMenu] = useState<string | null>(null);
  const [openStatusMenu, setOpenStatusMenu] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [sortField, setSortField] = useState<keyof Order>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ordered' | 'preparing' | 'delivered' | 'paid' | 'unpaid'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [favoriteOrders, setFavoriteOrders] = useState<string[]>([]);
  const [archivedOrders, setArchivedOrders] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchTerm('');
        searchInputRef.current?.blur();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        handleSelectAll();
      }
      if (e.key === 'Delete' && selectedOrders.length > 0 && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        handleBulkDelete();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedOrders]);

  // Charger les favoris et archivés
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteOrders');
    const savedArchived = localStorage.getItem('archivedOrders');
    if (savedFavorites) setFavoriteOrders(JSON.parse(savedFavorites));
    if (savedArchived) setArchivedOrders(JSON.parse(savedArchived));
  }, []);

  // Sauvegarder les favoris et archivés
  useEffect(() => {
    localStorage.setItem('favoriteOrders', JSON.stringify(favoriteOrders));
  }, [favoriteOrders]);

  useEffect(() => {
    localStorage.setItem('archivedOrders', JSON.stringify(archivedOrders));
  }, [archivedOrders]);

  const getPaymentMethodIcon = (method?: PaymentMethod) => {
    switch (method) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'check': return <CheckSquare className="h-4 w-4" />;
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'transfer': return <Building2 className="h-4 w-4" />;
      default: return null;
    }
  };

  const getPaymentMethodLabel = (method?: PaymentMethod) => {
    switch (method) {
      case 'card': return 'Carte bancaire';
      case 'check': return 'Chèque';
      case 'cash': return 'Espèces';
      case 'transfer': return 'Virement';
      default: return 'Non spécifié';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ordered': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'preparing': return <Package className="h-4 w-4 text-orange-500" />;
      case 'delivered': return <Truck className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = { ordered: 'Commandée', preparing: 'En préparation', delivered: 'Livrée' };
    return labels[status] || 'Commandée';
  };

  const handlePaymentMethodClick = (orderId: string, method: PaymentMethod) => {
    onTogglePayment(orderId, method);
    setOpenPaymentMenu(null);
  };

  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleStatusChange = (orderId: string, status: 'ordered' | 'preparing' | 'delivered') => {
    if (onUpdateStatus) {
      onUpdateStatus(orderId, status);
      setOpenStatusMenu(null);
      toast.success(`Statut mis à jour : ${getStatusLabel(status)}`);
    }
  };

  const handleToggleFavorite = (orderId: string) => {
    setFavoriteOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
    toast.success(favoriteOrders.includes(orderId) ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const handleToggleArchive = (orderId: string) => {
    setArchivedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
    toast.success(archivedOrders.includes(orderId) ? 'Désarchivé' : 'Archivé');
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedOrders.length === 0) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedOrders.length} commande(s) ?`)) {
      selectedOrders.forEach(orderId => onDelete(orderId));
      setSelectedOrders([]);
      toast.success(`${selectedOrders.length} commande(s) supprimée(s)`);
    }
  };

  const handleBulkArchive = () => {
    if (selectedOrders.length === 0) return;
    
    setArchivedOrders(prev => [...prev, ...selectedOrders]);
    setSelectedOrders([]);
    toast.success(`${selectedOrders.length} commande(s) archivée(s)`);
  };

  const handleBulkFavorite = () => {
    if (selectedOrders.length === 0) return;
    
    setFavoriteOrders(prev => [...prev, ...selectedOrders]);
    setSelectedOrders([]);
    toast.success(`${selectedOrders.length} commande(s) ajoutée(s) aux favoris`);
  };

  const handleGenerateBulkPDF = () => {
    if (selectedOrders.length === 0) {
      toast.error('Veuillez sélectionner au moins une commande');
      return;
    }

    const selectedOrdersData = filteredOrders.filter(order => selectedOrders.includes(order.id));
    
    try {
      generateBulkPDF(selectedOrdersData);
      toast.success(`PDF généré avec ${selectedOrdersData.length} facture(s)`);
      setSelectedOrders([]);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const handleGenerateExcel = () => {
    if (selectedOrders.length === 0) {
      toast.error('Veuillez sélectionner au moins une commande');
      return;
    }

    const selectedOrdersData = filteredOrders.filter(order => selectedOrders.includes(order.id));
    
    try {
      generateExcelFromOrders(selectedOrdersData);
      toast.success(`Excel généré avec ${selectedOrdersData.length} commande(s)`);
      setSelectedOrders([]);
    } catch (error) {
      console.error('Erreur génération Excel:', error);
      toast.error('Erreur lors de la génération du fichier Excel');
    }
  };

  // Tri et filtrage
  const sortedOrders = [...orders].sort((a, b) => {
    if (sortField === 'date') {
      return sortDirection === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return sortDirection === 'asc'
      ? String(a[sortField]).localeCompare(String(b[sortField]))
      : String(b[sortField]).localeCompare(String(a[sortField]));
  });

  let filteredOrders = sortedOrders.filter(order => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        order.customerName.toLowerCase().includes(searchLower) ||
        order.invoiceNumber.toLowerCase().includes(searchLower) ||
        order.address.toLowerCase().includes(searchLower) ||
        order.products.some(p => p.name.toLowerCase().includes(searchLower) || p.reference.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'paid' && !order.isPaid) return false;
      if (statusFilter === 'unpaid' && order.isPaid) return false;
      if (['ordered', 'preparing', 'delivered'].includes(statusFilter) && order.status !== statusFilter) return false;
    }

    if (dateFilter !== 'all') {
      const orderDate = new Date(order.date);
      const today = new Date();
      const diffTime = today.getTime() - orderDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (dateFilter === 'today' && diffDays > 1) return false;
      if (dateFilter === 'week' && diffDays > 7) return false;
      if (dateFilter === 'month' && diffDays > 30) return false;
    }

    return true;
  });

  if (!showArchived) {
    filteredOrders = filteredOrders.filter(order => !archivedOrders.includes(order.id));
  } else {
    filteredOrders = filteredOrders.filter(order => archivedOrders.includes(order.id));
  }

  filteredOrders.sort((a, b) => (favoriteOrders.includes(b.id) ? 1 : 0) - (favoriteOrders.includes(a.id) ? 1 : 0));

  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  const stats = {
    total: filteredOrders.length,
    paid: filteredOrders.filter(o => o.isPaid).length,
    unpaid: filteredOrders.filter(o => !o.isPaid).length,
    favorites: filteredOrders.filter(o => favoriteOrders.includes(o.id)).length,
    archived: archivedOrders.length,
    avgAmount: filteredOrders.length > 0 ? totalAmount / filteredOrders.length : 0,
    thisWeek: filteredOrders.filter(o => new Date(o.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    thisMonth: filteredOrders.filter(o => new Date(o.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
  };

  const SortIcon = ({ field }: { field: keyof Order }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtres et recherche</h3>
          </div>
          
          {/* Recherche principale */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher par nom, facture, adresse ou produit... (Ctrl+K)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-12 py-3 w-full border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filtres en ligne */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Filtre statut */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-10 pr-4 py-2.5 w-full border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white appearance-none bg-white dark:bg-slate-700 text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="ordered">Commandées</option>
                <option value="preparing">En préparation</option>
                <option value="delivered">Livrées</option>
                <option value="paid">Payées</option>
                <option value="unpaid">Non payées</option>
              </select>
            </div>

            {/* Filtre date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="pl-10 pr-4 py-2.5 w-full border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white appearance-none bg-white dark:bg-slate-700 text-sm"
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>

            {/* Bouton reset */}
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
              }}
              className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium text-sm border border-gray-300 dark:border-slate-600"
            >
              Réinitialiser
            </button>

            {/* Toggle archivés */}
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm border transition-colors ${
                showArchived 
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600'
              }`}
            >
              <Archive className="h-4 w-4 mr-2 inline" />
              {showArchived ? 'Actives' : 'Archivées'}
            </button>
          </div>
          
          {/* Indicateur de résultats */}
          <div className="pt-4 border-t border-gray-200 dark:border-slate-600">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-6">
                <span className="flex items-center">
                  <Package className="h-4 w-4 mr-2 text-indigo-500" />
                  <strong className="text-gray-900 dark:text-white">{filteredOrders.length}</strong> 
                  <span className="ml-1">commande{filteredOrders.length > 1 ? 's' : ''}</span>
                </span>
                <span className="flex items-center">
                  <Euro className="h-4 w-4 mr-2 text-green-500" />
                  <strong className="text-gray-900 dark:text-white">{totalAmount.toFixed(2)} €</strong>
                  <span className="ml-1">total</span>
                </span>
              </div>
              {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                  Filtres actifs
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions en lot */}
      {selectedOrders.length > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                {selectedOrders.length} commande(s) sélectionnée(s)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleGenerateBulkPDF}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                <FileText className="h-4 w-4 mr-1" />
                PDF ({selectedOrders.length})
              </button>
              <button
                onClick={handleGenerateExcel}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-1" />
                Excel ({selectedOrders.length})
              </button>
              <button
                onClick={() => {
                  // Déclencher l'ouverture du gestionnaire d'email avec les commandes sélectionnées
                  const event = new CustomEvent('openEmailManager', { 
                    detail: { selectedOrders } 
                  });
                  window.dispatchEvent(event);
                }}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Mail className="h-4 w-4 mr-1" />
                Email ({selectedOrders.length})
              </button>
              <button
                onClick={handleBulkFavorite}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 transition-colors"
              >
                <Star className="h-4 w-4 mr-1" />
                Favoris
              </button>
              <button
                onClick={handleBulkArchive}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                <Archive className="h-4 w-4 mr-1" />
                Archiver
              </button>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </button>
              <button
                onClick={() => setSelectedOrders([])}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                Désélectionner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des commandes */}
      <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm">
        <table className="w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-3 py-3 text-left w-12">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center space-x-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  title="Ctrl+A pour tout sélectionner"
                >
                  {selectedOrders.length === filteredOrders.length && filteredOrders.length > 0 ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-3 py-3 text-left w-12">
                <Star className="h-4 w-4 text-slate-400" />
              </th>
              <th 
                className="px-3 py-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center space-x-1 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Date</span>
                  <SortIcon field="date" />
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => handleSort('customerName')}
              >
                <div className="flex items-center space-x-1 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Client</span>
                  <SortIcon field="customerName" />
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => handleSort('invoiceNumber')}
              >
                <div className="flex items-center space-x-1 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>N° Facture</span>
                  <SortIcon field="invoiceNumber" />
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Statut commande
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Paiement
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {filteredOrders.map((order) => (
              <tr 
                key={order.id} 
                className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                  selectedOrders.includes(order.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                }`}
              >
                <td className="px-3 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleSelectOrder(order.id)}
                    className="flex items-center space-x-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    {selectedOrders.includes(order.id) ? (
                      <CheckSquare className="h-4 w-4 text-indigo-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleFavorite(order.id)}
                    className={`p-1 rounded transition-colors ${
                      favoriteOrders.includes(order.id) ? 'text-yellow-500' : 'text-gray-400'
                    } hover:bg-yellow-50 dark:hover:bg-yellow-900/20`}
                    title={favoriteOrders.includes(order.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    {favoriteOrders.includes(order.id) ? (
                      <Star className="h-4 w-4 fill-current" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </button>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-300">
                  {new Date(order.date).toLocaleDateString()}
                </td>
                <td className="px-3 py-4">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-300 truncate max-w-[200px]">
                    {order.customerName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                    {order.address}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-300">
                  {order.invoiceNumber}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-300">
                  {order.totalAmount.toFixed(2)} €
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="relative">
                    <button
                      type="button"
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => setOpenStatusMenu(openStatusMenu === order.id ? null : order.id)}
                    >
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{getStatusLabel(order.status)}</span>
                    </button>
                    {openStatusMenu === order.id && onUpdateStatus && (
                      <div className="absolute left-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 z-50 divide-y divide-slate-200 dark:divide-slate-600">
                        {(['ordered', 'preparing', 'delivered'] as const).map((status) => (
                          <button
                            key={status}
                            className="w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center space-x-2 transition-colors"
                            onClick={() => handleStatusChange(order.id, status)}
                          >
                            {getStatusIcon(status)}
                            <span>{getStatusLabel(status)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-500">
                  <div className="flex space-x-1">
                    {order.email && (
                      <Mail className="h-4 w-4 text-blue-500" title={order.email} />
                    )}
                    {order.phone && (
                      <Phone className="h-4 w-4 text-green-500" title={order.phone} />
                    )}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="relative">
                    {order.isPaid ? (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {getPaymentMethodIcon(order.paymentMethod)}
                        <span className="ml-1">
                          {getPaymentMethodLabel(order.paymentMethod)}
                        </span>
                      </div>
                    ) : (
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          onClick={() => setOpenPaymentMenu(openPaymentMenu === order.id ? null : order.id)}
                        >
                          Non payée
                        </button>
                        {openPaymentMenu === order.id && (
                          <div className="absolute left-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 z-50 divide-y divide-slate-200 dark:divide-slate-600">
                            {(['card', 'check', 'cash', 'transfer'] as PaymentMethod[]).map((method) => (
                              <button
                                key={method}
                                className="w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center space-x-2 transition-colors"
                                onClick={() => handlePaymentMethodClick(order.id, method)}
                              >
                                {getPaymentMethodIcon(method)}
                                <span>{getPaymentMethodLabel(method)}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-500">
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingOrder(order)}
                      className="p-1 text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors"
                      title="Modifier la commande"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {order.email && (
                      <button
                        onClick={() => {
                          // Importer dynamiquement le service email
                          import('../services/emailService.ts').then(({ sendOrderConfirmationEmail }) => {
                            sendOrderConfirmationEmail(order);
                          });
                        }}
                        className="p-1 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                        title="Envoyer email de confirmation"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => generateInvoicePDF(order)}
                      className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="Générer PDF"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${order.customerName} - ${order.invoiceNumber} - ${order.totalAmount}€`);
                        toast.success('Infos copiées !');
                      }}
                      className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded transition-colors"
                      title="Copier infos"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {order.phone && (
                      <button
                        onClick={() => window.open(`tel:${order.phone}`, '_self')}
                        className="p-1 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                        title="Appeler"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleArchive(order.id)}
                      className="p-1 text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                      title={archivedOrders.includes(order.id) ? 'Désarchiver' : 'Archiver'}
                    >
                      {archivedOrders.includes(order.id) ? (
                        <ArchiveRestore className="h-4 w-4" />
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(order.id)}
                      className="p-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center">
                    <PackageSearch className="h-12 w-12 mb-4 text-slate-400" />
                    <p className="text-lg font-medium">
                      {orders.length === 0 ? 'Aucune commande trouvée' : 'Aucun résultat pour ces filtres'}
                    </p>
                    <p className="mt-1">
                      {orders.length === 0 ? 'Commencez par créer une nouvelle commande' : 'Essayez de modifier vos critères de recherche'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <OrderDetails 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onRefresh={() => {
            // Déclencher un événement pour recharger les commandes
            const event = new CustomEvent('refreshOrders');
            window.dispatchEvent(event);
          }}
        />
      )}

      {editingOrder && onUpdateOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={onUpdateOrder}
        />
      )}
    </div>
  );
}