import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Calendar, BarChart3, Download, Star, Archive, X, Package, Euro, Clock, CheckCircle, CreditCard } from 'lucide-react';
import { Order } from '../types';

interface ClientStats {
  name: string;
  email?: string;
  phone?: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  averageOrderValue: number;
  isPaidPercentage: number;
}

interface ClientManagerProps {
  orders: Order[];
}

export default function ClientManager({ orders }: ClientManagerProps) {
  const [clientStats, setClientStats] = useState<ClientStats[]>([]);
  const [sortBy, setSortBy] = useState<'totalSpent' | 'totalOrders' | 'lastOrder' | 'name'>('totalSpent');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterVIP, setFilterVIP] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    calculateClientStats();
  }, [orders, sortBy, sortDirection, filterVIP, searchTerm]);

  const calculateClientStats = () => {
    const clientMap = new Map<string, ClientStats>();

    orders.forEach(order => {
      const key = order.customerName.toLowerCase();
      
      if (!clientMap.has(key)) {
        clientMap.set(key, {
          name: order.customerName,
          email: order.email,
          phone: order.phone,
          address: order.address,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.date,
          averageOrderValue: 0,
          isPaidPercentage: 0
        });
      }

      const client = clientMap.get(key)!;
      client.totalOrders++;
      client.totalSpent += order.totalAmount;
      
      if (new Date(order.date) > new Date(client.lastOrderDate)) {
        client.lastOrderDate = order.date;
        // Mettre à jour les infos de contact avec les plus récentes
        if (order.email) client.email = order.email;
        if (order.phone) client.phone = order.phone;
        client.address = order.address;
      }
    });

    // Calculer les moyennes et pourcentages
    clientMap.forEach((client, key) => {
      const clientOrders = orders.filter(o => o.customerName.toLowerCase() === key);
      client.averageOrderValue = client.totalSpent / client.totalOrders;
      client.isPaidPercentage = (clientOrders.filter(o => o.isPaid).length / clientOrders.length) * 100;
    });

    let stats = Array.from(clientMap.values());

    // Filtrage par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      stats = stats.filter(client => 
        client.name.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.phone?.includes(searchTerm) ||
        client.address.toLowerCase().includes(searchLower)
      );
    }

    // Filtre VIP (plus de 200€ dépensés)
    if (filterVIP) {
      stats = stats.filter(client => client.totalSpent >= 200);
    }

    // Tri
    stats.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'totalSpent':
          comparison = a.totalSpent - b.totalSpent;
          break;
        case 'totalOrders':
          comparison = a.totalOrders - b.totalOrders;
          break;
        case 'lastOrder':
          comparison = new Date(a.lastOrderDate).getTime() - new Date(b.lastOrderDate).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    setClientStats(stats);
  };

  const exportClients = () => {
    const csv = [
      'Nom,Email,Téléphone,Adresse,Commandes,Total dépensé,Panier moyen,% Payé,Dernière commande',
      ...clientStats.map(client => 
        `"${client.name}","${client.email || ''}","${client.phone || ''}","${client.address}",${client.totalOrders},${client.totalSpent.toFixed(2)},${client.averageOrderValue.toFixed(2)},${client.isPaidPercentage.toFixed(1)},${client.lastOrderDate}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients-stats.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Données clients exportées !');
  };

  const getClientBadge = (client: ClientStats) => {
    if (client.totalSpent >= 500) return { label: 'VIP Gold', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' };
    if (client.totalSpent >= 200) return { label: 'VIP', color: 'bg-gradient-to-r from-purple-500 to-purple-700 text-white' };
    if (client.totalOrders >= 5) return { label: 'Fidèle', color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' };
    return { label: 'Standard', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
  };

  const getClientOrders = (clientName: string) => {
    return orders.filter(order => order.customerName.toLowerCase() === clientName.toLowerCase());
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <User className="h-6 w-6 mr-3" />
              Gestion Clients
            </h2>
            <p className="mt-1 opacity-90">Analysez vos clients et leur historique</p>
          </div>
          <button
            onClick={exportClients}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
          >
            <Download className="h-4 w-4 mr-2 inline" />
            Exporter
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-teal-600">{clientStats.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Clients total</div>
            </div>
            <User className="h-8 w-8 text-teal-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {clientStats.filter(c => c.totalSpent >= 200).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Clients VIP</div>
            </div>
            <Star className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {clientStats.length > 0 ? (clientStats.reduce((sum, c) => sum + c.totalSpent, 0) / clientStats.length).toFixed(0) : 0}€
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Dépense moyenne</div>
            </div>
            <Euro className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {clientStats.length > 0 ? (clientStats.reduce((sum, c) => sum + c.totalOrders, 0) / clientStats.length).toFixed(1) : 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Commandes/client</div>
            </div>
            <BarChart3 className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Tri */}
          {/* Tri */}
          <select
            value={`${sortBy}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortBy(field as typeof sortBy);
              setSortDirection(direction as 'asc' | 'desc');
            }}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-700 dark:text-white bg-white shadow-lg hover:shadow-xl hover:border-teal-400 transition-all duration-200 cursor-pointer appearance-none bg-gradient-to-r from-white to-gray-50 dark:from-slate-700 dark:to-slate-600"
          >
            <option value="totalSpent-desc">💰 Plus gros montant</option>
            <option value="totalSpent-asc">💰 Plus petit montant</option>
            <option value="totalOrders-desc">📦 Plus de commandes</option>
            <option value="totalOrders-asc">📦 Moins de commandes</option>
            <option value="lastOrder-desc">📅 Plus récent</option>
            <option value="lastOrder-asc">📅 Plus ancien</option>
            <option value="name-asc">🔤 Nom A-Z</option>
            <option value="name-desc">🔤 Nom Z-A</option>
          </select>

          {/* Filtre VIP */}
         <label className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-200 cursor-pointer">
            <input
              type="checkbox"
              checked={filterVIP}
              onChange={(e) => setFilterVIP(e.target.checked)}
             className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200 flex items-center">
              <Star className="h-4 w-4 mr-1" />
              Clients VIP uniquement
            </span>
          </label>
        </div>
      </div>

      {/* Liste des clients */}
      <div className="grid gap-4">
        {clientStats.map((client, index) => {
          const badge = getClientBadge(client);
          return (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedClient(client)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                        {client.name}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color} shadow-sm`}>
                        {badge.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      {client.email && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Mail className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Phone className="h-4 w-4 mr-2 text-green-500" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Package className="h-4 w-4 mr-2 text-indigo-500" />
                        <span>{client.totalOrders} commande{client.totalOrders > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                        <span>{new Date(client.lastOrderDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {client.totalSpent.toFixed(2)}€
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Moy: {client.averageOrderValue.toFixed(2)}€
                    </div>
                    <div className="text-xs text-gray-400 flex items-center justify-end mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {client.isPaidPercentage.toFixed(0)}% payé
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {clientStats.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
          <User className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {orders.length === 0 ? 'Aucun client trouvé' : 'Aucun résultat'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {orders.length === 0 ? 'Commencez par créer des commandes' : 'Essayez de modifier vos critères de recherche'}
          </p>
        </div>
      )}

      {/* Modal détails client */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-full">
                    <User className="h-8 w-8 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                      <span>{selectedClient.name}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getClientBadge(selectedClient).color} shadow-sm`}>
                        {getClientBadge(selectedClient).label}
                      </span>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Client depuis le {new Date(Math.min(...getClientOrders(selectedClient.name).map(o => new Date(o.date).getTime()))).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Informations client */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                    Informations de contact
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{selectedClient.address}</span>
                    </div>
                    {selectedClient.email && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Mail className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{selectedClient.email}</span>
                      </div>
                    )}
                    {selectedClient.phone && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4 mr-2 text-green-500" />
                        <span>{selectedClient.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-gray-500" />
                    Statistiques
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-lg font-bold text-teal-600">{selectedClient.totalOrders}</div>
                      <div className="text-gray-500 dark:text-gray-400">Commandes</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{selectedClient.totalSpent.toFixed(2)}€</div>
                      <div className="text-gray-500 dark:text-gray-400">Total dépensé</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">{selectedClient.averageOrderValue.toFixed(2)}€</div>
                      <div className="text-gray-500 dark:text-gray-400">Panier moyen</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">{selectedClient.isPaidPercentage.toFixed(0)}%</div>
                      <div className="text-gray-500 dark:text-gray-400">Taux paiement</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historique des commandes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-teal-600" />
                  Historique des commandes ({getClientOrders(selectedClient.name).length})
                </h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getClientOrders(selectedClient.name)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((order) => (
                    <div
                      key={order.id}
                      className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {order.invoiceNumber}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.isPaid 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {order.isPaid ? 'Payée' : 'Non payée'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            order.status === 'preparing' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {order.status === 'delivered' ? 'Livrée' : 
                             order.status === 'preparing' ? 'En préparation' : 'Commandée'}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {order.totalAmount.toFixed(2)}€
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(order.date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      
                      {/* Produits de la commande */}
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Produits :</div>
                        <div className="flex flex-wrap gap-2">
                          {order.products.map((product, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded-md text-xs"
                            >
                              <Package className="h-3 w-3 mr-1 text-gray-400" />
                              {product.name} ({product.reference})
                              {product.parfumBrand && (
                                <span className="ml-1 text-purple-600 dark:text-purple-400">
                                  • {product.parfumBrand}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Mode de paiement */}
                      {order.isPaid && order.paymentMethod && (
                        <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <CreditCard className="h-3 w-3 mr-1" />
                          <span>
                            {order.paymentMethod === 'card' ? 'Carte bancaire' :
                             order.paymentMethod === 'check' ? 'Chèque' :
                             order.paymentMethod === 'cash' ? 'Espèces' :
                             order.paymentMethod === 'transfer' ? 'Virement' : 'Non spécifié'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}