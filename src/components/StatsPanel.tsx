import React, { useState } from 'react';
import { BarChart3, Calendar, TrendingUp, Package, Euro, CheckCircle, Clock, X, Users, DollarSign, Activity, PieChart } from 'lucide-react';
import { Order } from '../types';

interface StatsPanelProps {
  orders: Order[];
  onClose: () => void;
}

export default function StatsPanel({ orders, onClose }: StatsPanelProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Filtrer les commandes selon la période sélectionnée
  const getFilteredOrders = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return orders.filter(order => {
      const orderDate = new Date(order.date);
      
      switch (selectedPeriod) {
        case 'today':
          return orderDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return orderDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(today);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          return orderDate >= yearAgo;
        case 'custom':
          if (!customStartDate || !customEndDate) return true;
          const startDate = new Date(customStartDate);
          const endDate = new Date(customEndDate);
          return orderDate >= startDate && orderDate <= endDate;
        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();
  
  // Calculer les statistiques
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const paidOrders = filteredOrders.filter(order => order.isPaid).length;
  const unpaidOrders = totalOrders - paidOrders;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Statistiques par statut
  const orderedCount = filteredOrders.filter(o => o.status === 'ordered').length;
  const preparingCount = filteredOrders.filter(o => o.status === 'preparing').length;
  const deliveredCount = filteredOrders.filter(o => o.status === 'delivered').length;

  // Évolution par rapport à la période précédente (approximation)
  const getPreviousPeriodOrders = () => {
    const now = new Date();
    let startDate: Date, endDate: Date;
    
    switch (selectedPeriod) {
      case 'today':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 2);
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 14);
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 2);
        endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() - 1);
        break;
      default:
        return [];
    }
    
    return orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  const previousOrders = getPreviousPeriodOrders();
  const previousRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return "Aujourd'hui";
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      case 'year': return 'Cette année';
      case 'custom': return 'Période personnalisée';
      default: return 'Période sélectionnée';
    }
  };

  // Calculer les statistiques par mode de paiement
  const paymentStats = {
    card: filteredOrders.filter(o => o.paymentMethod === 'card').length,
    check: filteredOrders.filter(o => o.paymentMethod === 'check').length,
    cash: filteredOrders.filter(o => o.paymentMethod === 'cash').length,
    transfer: filteredOrders.filter(o => o.paymentMethod === 'transfer').length
  };

  // Top 5 clients
  const getTopClients = () => {
    const clientMap = new Map<string, { name: string; total: number; orders: number }>();
    
    filteredOrders.forEach(order => {
      const key = order.customerName.toLowerCase();
      if (!clientMap.has(key)) {
        clientMap.set(key, { name: order.customerName, total: 0, orders: 0 });
      }
      const client = clientMap.get(key)!;
      client.total += order.totalAmount;
      client.orders++;
    });

    return Array.from(clientMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  const topClients = getTopClients();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <BarChart3 className="h-6 w-6 mr-3" />
                  Statistiques Avancées
                </h2>
                <p className="mt-1 opacity-90">Analysez vos performances commerciales</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Sélecteur de période */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
              Période d'analyse : {getPeriodLabel()}
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
              {[
                { key: 'today', label: "Aujourd'hui", icon: '📅' },
                { key: 'week', label: 'Cette semaine', icon: '📊' },
                { key: 'month', label: 'Ce mois', icon: '📈' },
                { key: 'year', label: 'Cette année', icon: '🗓️' },
                { key: 'custom', label: 'Personnalisée', icon: '⚙️' }
              ].map(period => (
                <button
                  key={period.key}
                  onClick={() => setSelectedPeriod(period.key as any)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === period.key
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 hover:shadow-md'
                  }`}
                >
                  <span className="block text-lg mb-1">{period.icon}</span>
                  {period.label}
                </button>
              ))}
            </div>

            {/* Dates personnalisées */}
            {selectedPeriod === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Indicateur de résultats */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center">
                  <Package className="h-4 w-4 mr-2 text-indigo-500" />
                  <strong className="text-gray-900 dark:text-white">{totalOrders}</strong>
                  <span className="ml-1">commande{totalOrders > 1 ? 's' : ''} analysée{totalOrders > 1 ? 's' : ''}</span>
                </span>
                <span className="flex items-center">
                  <Euro className="h-4 w-4 mr-2 text-green-500" />
                  <strong className="text-gray-900 dark:text-white">{totalRevenue.toFixed(2)} €</strong>
                  <span className="ml-1">de chiffre d'affaires</span>
                </span>
              </div>
            </div>
          </div>

          {/* Statistiques principales - Grid responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Commandes</p>
                  <p className="text-3xl font-bold">{totalOrders}</p>
                  {previousOrders.length > 0 && (
                    <p className="text-blue-100 text-sm flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {((totalOrders - previousOrders.length) / Math.max(previousOrders.length, 1) * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
                <Package className="h-12 w-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Chiffre d'Affaires</p>
                  <p className="text-3xl font-bold">{totalRevenue.toFixed(0)}€</p>
                  {revenueGrowth !== 0 && (
                    <p className="text-green-100 text-sm flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                    </p>
                  )}
                </div>
                <Euro className="h-12 w-12 text-green-200" />
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
                <CheckCircle className="h-12 w-12 text-emerald-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Panier Moyen</p>
                  <p className="text-3xl font-bold">{averageOrderValue.toFixed(0)}€</p>
                  <p className="text-orange-100 text-sm">
                    {unpaidOrders} en attente
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Grille responsive pour les analyses détaillées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Répartition par statut */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
                Répartition par Statut
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Commandées</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: totalOrders > 0 ? `${(orderedCount / totalOrders) * 100}%` : '0%' }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white min-w-[2rem] text-right">
                      {orderedCount}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">En préparation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: totalOrders > 0 ? `${(preparingCount / totalOrders) * 100}%` : '0%' }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white min-w-[2rem] text-right">
                      {preparingCount}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Livrées</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: totalOrders > 0 ? `${(deliveredCount / totalOrders) * 100}%` : '0%' }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white min-w-[2rem] text-right">
                      {deliveredCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Métriques supplémentaires */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                Métriques Clés
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Panier moyen</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {averageOrderValue.toFixed(2)}€
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Taux de paiement</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">CA moyen/jour</span>
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {selectedPeriod === 'today' ? totalRevenue.toFixed(2) : 
                     selectedPeriod === 'week' ? (totalRevenue / 7).toFixed(2) :
                     selectedPeriod === 'month' ? (totalRevenue / 30).toFixed(2) :
                     selectedPeriod === 'year' ? (totalRevenue / 365).toFixed(2) :
                     (totalRevenue / Math.max(1, totalOrders)).toFixed(2)}€
                  </span>
                </div>
                {previousOrders.length > 0 && (
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Évolution CA</span>
                    <span className={`text-xl font-bold flex items-center ${
                      revenueGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      <TrendingUp className={`h-4 w-4 mr-1 ${revenueGrowth < 0 ? 'rotate-180' : ''}`} />
                      {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section inférieure - Grid responsive */}
          <div className="space-y-6">
            {/* Top 5 clients */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-4 sm:p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Users className="h-5 w-5 mr-2 text-teal-600" />
                Top 5 Clients
              </h4>
              {topClients.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {topClients.map((client, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-lg border border-gray-200 dark:border-slate-600">
                      <div className="flex items-center justify-center mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                          index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                          'bg-gradient-to-r from-blue-400 to-blue-600'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate" title={client.name}>
                          {client.name}
                        </div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {client.total.toFixed(2)}€
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {client.orders} commande{client.orders > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Aucune donnée client pour cette période</p>
                </div>
              )}
            </div>

            {/* Modes de paiement */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-4 sm:p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
                Modes de Paiement
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { key: 'card', label: 'Carte bancaire', icon: '💳', color: 'from-blue-500 to-blue-600' },
                  { key: 'check', label: 'Chèque', icon: '📝', color: 'from-green-500 to-green-600' },
                  { key: 'cash', label: 'Espèces', icon: '💵', color: 'from-yellow-500 to-yellow-600' },
                  { key: 'transfer', label: 'Virement', icon: '🏦', color: 'from-purple-500 to-purple-600' }
                ].map(method => {
                  const count = paymentStats[method.key as keyof typeof paymentStats];
                  const percentage = paidOrders > 0 ? (count / paidOrders) * 100 : 0;
                  
                  return (
                    <div key={method.key} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg text-center">
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-xl">{method.icon}</span>
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 font-medium mb-2">
                        {method.label}
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r ${method.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {count}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {paidOrders === 0 && (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <CheckCircle className="mx-auto h-10 w-10 mb-3 opacity-50" />
                  <p className="text-sm">Aucun paiement pour cette période</p>
                </div>
              )}
            </div>
          </div>

          {/* Résumé final */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-slate-600">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
              📊 Résumé de la période
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {new Set(filteredOrders.map(o => o.customerName)).size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Clients uniques</div>
              </div>
              <div className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {filteredOrders.reduce((sum, o) => sum + o.products.length, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Produits vendus</div>
              </div>
              <div className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : 0}€
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Commande moyenne</div>
              </div>
              <div className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {deliveredCount > 0 ? ((deliveredCount / totalOrders) * 100).toFixed(0) : 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Taux de livraison</div>
              </div>
            </div>
          </div>

          {/* Message si aucune donnée */}
          {totalOrders === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
              <BarChart3 className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune donnée pour cette période
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Sélectionnez une autre période ou créez des commandes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}