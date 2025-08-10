import React, { useState } from 'react';
import { BarChart3, Calendar, TrendingUp, Package, Euro, CheckCircle, Clock, X } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="h-6 w-6 mr-3 text-indigo-600" />
              Statistiques des Commandes
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 text-2xl"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Sélecteur de période */}
          <div className="mb-8 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Période d'analyse
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {[
                { key: 'today', label: "Aujourd'hui" },
                { key: 'week', label: 'Cette semaine' },
                { key: 'month', label: 'Ce mois' },
                { key: 'year', label: 'Cette année' },
                { key: 'custom', label: 'Personnalisée' }
              ].map(period => (
                <button
                  key={period.key}
                  onClick={() => setSelectedPeriod(period.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-500'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            {/* Dates personnalisées */}
            {selectedPeriod === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Titre de la période */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Résultats pour : {getPeriodLabel()}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {totalOrders} commande{totalOrders > 1 ? 's' : ''} trouvée{totalOrders > 1 ? 's' : ''}
            </p>
          </div>

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Commandes</p>
                  <p className="text-3xl font-bold">{totalOrders}</p>
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
                    <p className="text-green-100 text-sm flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
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
                  <p className="text-orange-100 text-sm font-medium">En Attente</p>
                  <p className="text-3xl font-bold">{unpaidOrders}</p>
                  <p className="text-orange-100 text-sm">
                    {totalOrders > 0 ? ((unpaidOrders / totalOrders) * 100).toFixed(1) : 0}% du total
                  </p>
                </div>
                <Clock className="h-12 w-12 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Statistiques détaillées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Répartition par statut */}
            <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Répartition par Statut
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Commandées</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: totalOrders > 0 ? `${(orderedCount / totalOrders) * 100}%` : '0%' }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                      {orderedCount}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">En préparation</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: totalOrders > 0 ? `${(preparingCount / totalOrders) * 100}%` : '0%' }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                      {preparingCount}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Livrées</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: totalOrders > 0 ? `${(deliveredCount / totalOrders) * 100}%` : '0%' }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                      {deliveredCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Métriques supplémentaires */}
            <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Métriques Clés
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Panier moyen</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {averageOrderValue.toFixed(2)}€
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Taux de paiement</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">CA moyen/jour</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedPeriod === 'today' ? totalRevenue.toFixed(2) : 
                     selectedPeriod === 'week' ? (totalRevenue / 7).toFixed(2) :
                     selectedPeriod === 'month' ? (totalRevenue / 30).toFixed(2) :
                     selectedPeriod === 'year' ? (totalRevenue / 365).toFixed(2) :
                     (totalRevenue / Math.max(1, totalOrders)).toFixed(2)}€
                  </span>
                </div>
                {previousOrders.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Évolution CA</span>
                    <span className={`text-lg font-semibold flex items-center ${
                      revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bouton fermer */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Fermer les statistiques
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}