import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Edit, 
  Trash2, 
  CreditCard, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Euro, 
  Star,
  ChevronDown,
  Eye,
  FileText,
  Users,
  Truck
} from 'lucide-react';
import { Order, PaymentMethod } from '../types';
import { generateInvoicePDF } from '../utils/generateInvoicePDF';
import { generateBulkPDF } from '../utils/generateBulkPDF';
import { generateExcelFromOrders } from '../utils/generateExcel';
import OrderDetails from './OrderDetails';
import EditOrderModal from './EditOrderModal';

interface OrderListProps {
  orders: Order[];
  onDelete: (id: string) => void;
  onTogglePayment: (id: string, method: PaymentMethod) => void;
  onUpdateStatus: (id: string, status: 'ordered' | 'preparing' | 'delivered') => void;
  onUpdateOrder: (order: Order) => void;
}

export default function OrderList({ orders, onDelete, onTogglePayment, onUpdateStatus, onUpdateOrder }: OrderListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ordered' | 'preparing' | 'delivered' | 'paid' | 'unpaid'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showPaymentMenu, setShowPaymentMenu] = useState<string | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);
  const [showBulkStatusMenu, setShowBulkStatusMenu] = useState(false);

  // Filtrer et trier les commandes
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const matchesSearch = 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products.some(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.reference.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'paid' && order.isPaid) ||
        (statusFilter === 'unpaid' && !order.isPaid) ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'customer':
          comparison = a.customerName.localeCompare(b.customerName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [orders, searchTerm, statusFilter, sortBy, sortDirection]);

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredAndSortedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredAndSortedOrders.map(order => order.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedOrders.length === 0) return;
    
    if (confirm(`Supprimer ${selectedOrders.length} commande(s) sélectionnée(s) ?`)) {
      selectedOrders.forEach(orderId => onDelete(orderId));
      setSelectedOrders([]);
      toast.success(`${selectedOrders.length} commande(s) supprimée(s)`);
    }
  };

  const handleBulkPDF = () => {
    if (selectedOrders.length === 0) return;
    
    const selectedOrdersData = orders.filter(order => selectedOrders.includes(order.id));
    generateBulkPDF(selectedOrdersData);
    toast.success(`PDF généré pour ${selectedOrders.length} commande(s)`);
  };

  const handleBulkExcel = () => {
    if (selectedOrders.length === 0) return;
    
    const selectedOrdersData = orders.filter(order => selectedOrders.includes(order.id));
    generateExcelFromOrders(selectedOrdersData);
    toast.success(`Excel généré pour ${selectedOrders.length} commande(s)`);
  };

  const handleBulkEmail = () => {
    if (selectedOrders.length === 0) return;
    
    const event = new CustomEvent('openEmailManager', {
      detail: { selectedOrders }
    });
    window.dispatchEvent(event);
  };

  const handleBulkStatusChange = (newStatus: 'ordered' | 'preparing' | 'delivered') => {
    if (selectedOrders.length === 0) return;
    
    if (confirm(`Changer le statut de ${selectedOrders.length} commande(s) vers "${
      newStatus === 'ordered' ? 'Commandée' :
      newStatus === 'preparing' ? 'En préparation' :
      'Livrée'
    }" ?`)) {
      selectedOrders.forEach(orderId => onUpdateStatus(orderId, newStatus));
      setSelectedOrders([]);
      setShowBulkStatusMenu(false);
      toast.success(`Statut mis à jour pour ${selectedOrders.length} commande(s)`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ordered':
        return { label: 'Commandée', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
      case 'preparing':
        return { label: 'En préparation', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' };
      case 'delivered':
        return { label: 'Livrée', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' };
    }
  };

  const getPaymentMethodLabel = (method?: PaymentMethod) => {
    switch (method) {
      case 'card': return 'Carte';
      case 'check': return 'Chèque';
      case 'cash': return 'Espèces';
      case 'transfer': return 'Virement';
      default: return 'Non spécifié';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Aucune commande trouvée
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Commencez par créer votre première commande
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec gradient */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Package className="h-6 w-6 mr-3" />
              Liste des Commandes
            </h2>
            <p className="mt-1 opacity-90">Gérez toutes vos commandes en un coup d'œil</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{filteredAndSortedOrders.length}</div>
            <div className="text-sm opacity-90">commande{filteredAndSortedOrders.length > 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Filtre par statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white bg-white shadow-lg hover:shadow-xl hover:border-indigo-400 transition-all duration-200 cursor-pointer"
          >
            <option value="all">📋 Tous les statuts</option>
            <option value="ordered">📦 Commandées</option>
            <option value="preparing">⏳ En préparation</option>
            <option value="delivered">✅ Livrées</option>
            <option value="paid">💰 Payées</option>
            <option value="unpaid">⏰ Non payées</option>
          </select>

          {/* Tri */}
          <select
            value={`${sortBy}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortBy(field as any);
              setSortDirection(direction as any);
            }}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white bg-white shadow-lg hover:shadow-xl hover:border-indigo-400 transition-all duration-200 cursor-pointer"
          >
            <option value="date-desc">📅 Plus récent</option>
            <option value="date-asc">📅 Plus ancien</option>
            <option value="amount-desc">💰 Plus cher</option>
            <option value="amount-asc">💰 Moins cher</option>
            <option value="customer-asc">👤 Client A-Z</option>
            <option value="customer-desc">👤 Client Z-A</option>
            <option value="status-asc">📊 Statut A-Z</option>
            <option value="status-desc">📊 Statut Z-A</option>
          </select>
        </div>
      </div>

      {/* Actions en lot */}
      {selectedOrders.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {selectedOrders.length} commande(s) sélectionnée(s)
              </span>
              <button
                onClick={() => setSelectedOrders([])}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Désélectionner tout
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleBulkPDF}
                className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <FileText className="h-4 w-4 mr-1" />
                PDF
              </button>
              <button
                onClick={handleBulkExcel}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Download className="h-4 w-4 mr-1" />
                Excel
              </button>
              <button
                onClick={handleBulkEmail}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </button>
              
              {/* Menu statut en lot */}
              <div className="relative">
                <button
                  onClick={() => setShowBulkStatusMenu(!showBulkStatusMenu)}
                  className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <Truck className="h-4 w-4 mr-1" />
                  Statut
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                
                {showBulkStatusMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[160px]">
                    <button
                      onClick={() => handleBulkStatusChange('ordered')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                    >
                      <Package className="h-4 w-4 mr-2 text-blue-500" />
                      Commandée
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('preparing')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                    >
                      <Clock className="h-4 w-4 mr-2 text-orange-500" />
                      En préparation
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('delivered')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Livrée
                    </button>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version Desktop - Tableau */}
      <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredAndSortedOrders.length && filteredAndSortedOrders.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Facture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Produits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-600">
              {filteredAndSortedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.customerName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        {order.address}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.invoiceNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-[200px]">
                      {order.products.map((product, idx) => (
                        <div key={idx} className="mb-1">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-gray-500 dark:text-gray-400 text-xs block">
                            {product.reference}
                            {product.parfumBrand && (
                              <span className="text-purple-600 dark:text-purple-400 ml-1">
                                • {product.parfumBrand}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {order.totalAmount.toFixed(2)}€
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(order.date).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative">
                      <button
                        onClick={() => setShowStatusMenu(showStatusMenu === order.id ? null : order.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:shadow-md transition-all ${getStatusBadge(order.status).color}`}
                      >
                        {getStatusBadge(order.status).label}
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </button>
                      
                      {showStatusMenu === order.id && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[140px]">
                          <button
                            onClick={() => {
                              onUpdateStatus(order.id, 'ordered');
                              setShowStatusMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                          >
                            <Package className="h-4 w-4 mr-2 text-blue-500" />
                            Commandée
                          </button>
                          <button
                            onClick={() => {
                              onUpdateStatus(order.id, 'preparing');
                              setShowStatusMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                          >
                            <Clock className="h-4 w-4 mr-2 text-orange-500" />
                            En préparation
                          </button>
                          <button
                            onClick={() => {
                              onUpdateStatus(order.id, 'delivered');
                              setShowStatusMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Livrée
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.isPaid ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </span>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => setShowPaymentMenu(showPaymentMenu === order.id ? null : order.id)}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:shadow-md transition-all cursor-pointer"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Non payée
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </button>
                        
                        {showPaymentMenu === order.id && (
                          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[140px]">
                            <button
                              onClick={() => {
                                onTogglePayment(order.id, 'card');
                                setShowPaymentMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                            >
                              <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                              Carte bancaire
                            </button>
                            <button
                              onClick={() => {
                                onTogglePayment(order.id, 'check');
                                setShowPaymentMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                            >
                              <FileText className="h-4 w-4 mr-2 text-green-500" />
                              Chèque
                            </button>
                            <button
                              onClick={() => {
                                onTogglePayment(order.id, 'cash');
                                setShowPaymentMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                            >
                              <Euro className="h-4 w-4 mr-2 text-yellow-500" />
                              Espèces
                            </button>
                            <button
                              onClick={() => {
                                onTogglePayment(order.id, 'transfer');
                                setShowPaymentMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                            >
                              <Users className="h-4 w-4 mr-2 text-purple-500" />
                              Virement
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingOrder(order)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => generateInvoicePDF(order)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Générer PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Supprimer cette commande ?')) {
                            onDelete(order.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Version Mobile/Tablet - Cards */}
      <div className="lg:hidden space-y-4">
        {filteredAndSortedOrders.map((order) => {
          const statusBadge = getStatusBadge(order.status);
          
          return (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                {/* Header avec sélection et infos principales */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                          {order.customerName}
                        </h4>
                        {order.totalAmount >= 100 && (
                          <Star className="h-4 w-4 text-yellow-500" title="Commande importante" />
                        )}
                      </div>
                      <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                        Facture #{order.invoiceNumber}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {order.totalAmount.toFixed(2)}€
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>

                {/* Adresse */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {order.address}
                    </span>
                  </div>
                </div>

                {/* Contact */}
                {(order.email || order.phone) && (
                  <div className="mb-4 flex flex-wrap gap-3">
                    {order.email && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                          {order.email}
                        </span>
                      </div>
                    )}
                    {order.phone && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {order.phone}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Produits */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Package className="h-4 w-4 mr-1" />
                    Produits ({order.products.length})
                  </div>
                  <div className="space-y-2">
                    {order.products.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {product.reference}
                            {product.parfumBrand && (
                              <span className="text-purple-600 dark:text-purple-400 ml-1">
                                • {product.parfumBrand}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statuts */}
                <div className="mb-4 flex flex-wrap gap-3">
                  {/* Statut de commande */}
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusMenu(showStatusMenu === order.id ? null : order.id)}
                      className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium cursor-pointer hover:shadow-md transition-all ${statusBadge.color}`}
                    >
                      {statusBadge.label}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </button>
                    
                    {showStatusMenu === order.id && (
                      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[160px]">
                        <button
                          onClick={() => {
                            onUpdateStatus(order.id, 'ordered');
                            setShowStatusMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                        >
                          <Package className="h-4 w-4 mr-2 text-blue-500" />
                          Commandée
                        </button>
                        <button
                          onClick={() => {
                            onUpdateStatus(order.id, 'preparing');
                            setShowStatusMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                        >
                          <Clock className="h-4 w-4 mr-2 text-orange-500" />
                          En préparation
                        </button>
                        <button
                          onClick={() => {
                            onUpdateStatus(order.id, 'delivered');
                            setShowStatusMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Livrée
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Statut de paiement */}
                  {order.isPaid ? (
                    <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </span>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => setShowPaymentMenu(showPaymentMenu === order.id ? null : order.id)}
                        className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:shadow-md transition-all cursor-pointer"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Non payée
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </button>
                      
                      {showPaymentMenu === order.id && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[160px]">
                          <button
                            onClick={() => {
                              onTogglePayment(order.id, 'card');
                              setShowPaymentMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                          >
                            <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                            Carte bancaire
                          </button>
                          <button
                            onClick={() => {
                              onTogglePayment(order.id, 'check');
                              setShowPaymentMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-2 text-green-500" />
                            Chèque
                          </button>
                          <button
                            onClick={() => {
                              onTogglePayment(order.id, 'cash');
                              setShowPaymentMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                          >
                            <Euro className="h-4 w-4 mr-2 text-yellow-500" />
                            Espèces
                          </button>
                          <button
                            onClick={() => {
                              onTogglePayment(order.id, 'transfer');
                              setShowPaymentMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-sm flex items-center"
                          >
                            <Users className="h-4 w-4 mr-2 text-purple-500" />
                            Virement
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Détails
                  </button>
                  <button
                    onClick={() => setEditingOrder(order)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </button>
                  <button
                    onClick={() => generateInvoicePDF(order)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Supprimer cette commande ?')) {
                        onDelete(order.id);
                      }
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message si aucune commande */}
      {filteredAndSortedOrders.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
          <Package className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune commande trouvée
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {orders.length === 0 ? 'Commencez par créer des commandes' : 'Essayez de modifier vos critères de recherche'}
          </p>
        </div>
      )}

      {/* Modales */}
      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onRefresh={() => {
            const event = new CustomEvent('refreshOrders');
            window.dispatchEvent(event);
          }}
        />
      )}

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={onUpdateOrder}
        />
      )}
    </div>
  );
}