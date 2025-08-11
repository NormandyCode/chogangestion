import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Calendar, Download, BarChart3, TrendingUp, DollarSign, Users, Package, PieChart, Activity } from 'lucide-react';
import { Order } from '../types';
import * as XLSX from 'xlsx';

interface ReportsGeneratorProps {
  orders: Order[];
}

export default function ReportsGenerator({ orders }: ReportsGeneratorProps) {
  const [reportType, setReportType] = useState<'sales' | 'clients' | 'products' | 'financial'>('sales');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getFilteredOrders = () => {
    const now = new Date();
    let start: Date, end: Date;

    switch (dateRange) {
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = now;
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
        break;
      case 'custom':
        if (!startDate || !endDate) return orders;
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        return orders;
    }

    return orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= start && orderDate <= end;
    });
  };

  const generateSalesReport = () => {
    const filteredOrders = getFilteredOrders();
    
    const data = [
      ['Rapport de Ventes'],
      ['Période', `${dateRange === 'custom' ? `${startDate} - ${endDate}` : dateRange}`],
      [''],
      ['Métriques Générales'],
      ['Total Commandes', filteredOrders.length],
      ['Chiffre d\'Affaires', `${filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}€`],
      ['Panier Moyen', `${filteredOrders.length > 0 ? (filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0) / filteredOrders.length).toFixed(2) : 0}€`],
      ['Commandes Payées', filteredOrders.filter(o => o.isPaid).length],
      ['Taux de Paiement', `${filteredOrders.length > 0 ? ((filteredOrders.filter(o => o.isPaid).length / filteredOrders.length) * 100).toFixed(1) : 0}%`],
      [''],
      ['Détail par Statut'],
      ['Commandées', filteredOrders.filter(o => o.status === 'ordered').length],
      ['En Préparation', filteredOrders.filter(o => o.status === 'preparing').length],
      ['Livrées', filteredOrders.filter(o => o.status === 'delivered').length],
      [''],
      ['Top 5 Clients'],
      ...getTopClients(filteredOrders, 5).map(client => [client.name, `${client.total.toFixed(2)}€`])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport Ventes');
    XLSX.writeFile(wb, `rapport-ventes-${dateRange}.xlsx`);
    toast.success('Rapport de ventes généré !');
  };

  const generateClientsReport = () => {
    const filteredOrders = getFilteredOrders();
    const clientStats = getClientStats(filteredOrders);
    
    const data = [
      ['Nom Client', 'Email', 'Téléphone', 'Nb Commandes', 'Total Dépensé', 'Panier Moyen', '% Payé', 'Dernière Commande'],
      ...clientStats.map(client => [
        client.name,
        client.email || '',
        client.phone || '',
        client.totalOrders,
        `${client.totalSpent.toFixed(2)}€`,
        `${client.averageOrderValue.toFixed(2)}€`,
        `${client.isPaidPercentage.toFixed(1)}%`,
        client.lastOrderDate
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport Clients');
    XLSX.writeFile(wb, `rapport-clients-${dateRange}.xlsx`);
    toast.success('Rapport clients généré !');
  };

  const generateProductsReport = () => {
    const filteredOrders = getFilteredOrders();
    const productStats = getProductStats(filteredOrders);
    
    const data = [
      ['Produit', 'Référence', 'Marque', 'Nb Commandes', 'Popularité'],
      ...productStats.map(product => [
        product.name,
        product.reference,
        product.brand || '',
        product.orderCount,
        `${product.popularity.toFixed(1)}%`
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport Produits');
    XLSX.writeFile(wb, `rapport-produits-${dateRange}.xlsx`);
    toast.success('Rapport produits généré !');
  };

  const generateFinancialReport = () => {
    const filteredOrders = getFilteredOrders();
    
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const paidRevenue = filteredOrders.filter(o => o.isPaid).reduce((sum, o) => sum + o.totalAmount, 0);
    const unpaidRevenue = totalRevenue - paidRevenue;
    
    const paymentMethods = {
      card: filteredOrders.filter(o => o.paymentMethod === 'card').reduce((sum, o) => sum + o.totalAmount, 0),
      check: filteredOrders.filter(o => o.paymentMethod === 'check').reduce((sum, o) => sum + o.totalAmount, 0),
      cash: filteredOrders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.totalAmount, 0),
      transfer: filteredOrders.filter(o => o.paymentMethod === 'transfer').reduce((sum, o) => sum + o.totalAmount, 0)
    };

    const data = [
      ['Rapport Financier'],
      ['Période', `${dateRange === 'custom' ? `${startDate} - ${endDate}` : dateRange}`],
      [''],
      ['Chiffre d\'Affaires'],
      ['CA Total', `${totalRevenue.toFixed(2)}€`],
      ['CA Encaissé', `${paidRevenue.toFixed(2)}€`],
      ['CA En Attente', `${unpaidRevenue.toFixed(2)}€`],
      ['Taux d\'Encaissement', `${totalRevenue > 0 ? ((paidRevenue / totalRevenue) * 100).toFixed(1) : 0}%`],
      [''],
      ['Répartition par Mode de Paiement'],
      ['Carte Bancaire', `${paymentMethods.card.toFixed(2)}€`],
      ['Chèque', `${paymentMethods.check.toFixed(2)}€`],
      ['Espèces', `${paymentMethods.cash.toFixed(2)}€`],
      ['Virement', `${paymentMethods.transfer.toFixed(2)}€`],
      [''],
      ['Évolution Mensuelle'],
      ...getMonthlyEvolution(filteredOrders).map(month => [month.month, `${month.revenue.toFixed(2)}€`, month.orders])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport Financier');
    XLSX.writeFile(wb, `rapport-financier-${dateRange}.xlsx`);
    toast.success('Rapport financier généré !');
  };

  const getTopClients = (orders: Order[], limit: number) => {
    const clientMap = new Map<string, { name: string; total: number }>();
    
    orders.forEach(order => {
      const key = order.customerName.toLowerCase();
      if (!clientMap.has(key)) {
        clientMap.set(key, { name: order.customerName, total: 0 });
      }
      clientMap.get(key)!.total += order.totalAmount;
    });

    return Array.from(clientMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  };

  const getClientStats = (orders: Order[]) => {
    const clientMap = new Map<string, any>();

    orders.forEach(order => {
      const key = order.customerName.toLowerCase();
      
      if (!clientMap.has(key)) {
        clientMap.set(key, {
          name: order.customerName,
          email: order.email,
          phone: order.phone,
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
      }
    });

    clientMap.forEach((client, key) => {
      const clientOrders = orders.filter(o => o.customerName.toLowerCase() === key);
      client.averageOrderValue = client.totalSpent / client.totalOrders;
      client.isPaidPercentage = (clientOrders.filter(o => o.isPaid).length / clientOrders.length) * 100;
    });

    return Array.from(clientMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  };

  const getProductStats = (orders: Order[]) => {
    const productMap = new Map<string, any>();
    
    orders.forEach(order => {
      order.products.forEach(product => {
        const key = product.reference;
        if (!productMap.has(key)) {
          productMap.set(key, {
            name: product.name,
            reference: product.reference,
            brand: product.parfumBrand,
            orderCount: 0
          });
        }
        productMap.get(key)!.orderCount++;
      });
    });

    const totalProducts = Array.from(productMap.values()).reduce((sum, p) => sum + p.orderCount, 0);
    
    return Array.from(productMap.values())
      .map(product => ({
        ...product,
        popularity: totalProducts > 0 ? (product.orderCount / totalProducts) * 100 : 0
      }))
      .sort((a, b) => b.orderCount - a.orderCount);
  };

  const getMonthlyEvolution = (orders: Order[]) => {
    const monthMap = new Map<string, { revenue: number; orders: number }>();
    
    orders.forEach(order => {
      const month = new Date(order.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
      if (!monthMap.has(month)) {
        monthMap.set(month, { revenue: 0, orders: 0 });
      }
      const monthData = monthMap.get(month)!;
      monthData.revenue += order.totalAmount;
      monthData.orders++;
    });

    return Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orders: data.orders
    }));
  };

  const generateReport = () => {
    switch (reportType) {
      case 'sales':
        generateSalesReport();
        break;
      case 'clients':
        generateClientsReport();
        break;
      case 'products':
        generateProductsReport();
        break;
      case 'financial':
        generateFinancialReport();
        break;
    }
  };

  const filteredOrders = getFilteredOrders();
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const paidOrders = filteredOrders.filter(o => o.isPaid).length;

  const reportTypeOptions = [
    { key: 'sales', label: 'Rapport de Ventes', icon: '📊', color: 'from-blue-500 to-blue-600' },
    { key: 'clients', label: 'Rapport Clients', icon: '👥', color: 'from-teal-500 to-cyan-600' },
    { key: 'products', label: 'Rapport Produits', icon: '📦', color: 'from-purple-500 to-indigo-600' },
    { key: 'financial', label: 'Rapport Financier', icon: '💰', color: 'from-green-500 to-emerald-600' }
  ];

  const currentReportType = reportTypeOptions.find(r => r.key === reportType)!;

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className={`bg-gradient-to-r ${currentReportType.color} rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <FileText className="h-6 w-6 mr-3" />
              Rapports Avancés
            </h2>
            <p className="mt-1 opacity-90">Générez des rapports détaillés pour votre activité</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{filteredOrders.length}</div>
            <div className="text-sm opacity-90">Commandes analysées</div>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{filteredOrders.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Commandes</div>
            </div>
            <Package className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{totalRevenue.toFixed(0)}€</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Chiffre d'affaires</div>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{paidOrders}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Payées</div>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {new Set(filteredOrders.map(o => o.customerName)).size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Clients uniques</div>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Configuration du rapport */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
          Configuration du rapport
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Type de rapport */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Type de rapport
            </label>
            <div className="space-y-2">
              {reportTypeOptions.map((option) => (
                <label
                  key={option.key}
                  className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    reportType === option.key
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={option.key}
                    checked={reportType === option.key}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                    </div>
                  </div>
                  {reportType === option.key && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Période */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Période d'analyse
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white bg-white shadow-lg hover:shadow-xl hover:border-orange-400 transition-all duration-200 cursor-pointer appearance-none bg-gradient-to-r from-white to-gray-50 dark:from-slate-700 dark:to-slate-600"
            >
              <option value="week">📅 Cette semaine</option>
              <option value="month">📅 Ce mois</option>
              <option value="quarter">📅 Ce trimestre</option>
              <option value="year">📅 Cette année</option>
              <option value="custom">🗓️ Période personnalisée</option>
            </select>

            {/* Dates personnalisées */}
            {dateRange === 'custom' && (
              <div className="grid grid-cols-1 gap-3 mt-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Génération */}
          <div className="flex flex-col justify-end">
            <button
              onClick={generateReport}
              className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-medium shadow-lg"
            >
              <Download className="h-5 w-5 mr-2 inline" />
              Générer Rapport Excel
            </button>
          </div>
        </div>
      </div>

      {/* Aperçu des données */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <PieChart className="h-5 w-5 mr-2 text-orange-600" />
          Aperçu des données - {currentReportType.label}
        </h3>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {filteredOrders.length}
              </div>
              <div className="text-orange-500 dark:text-orange-300">Commandes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalRevenue.toFixed(0)}€
              </div>
              <div className="text-green-500 dark:text-green-300">Chiffre d'affaires</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredOrders.length > 0 ? (totalRevenue / filteredOrders.length).toFixed(0) : 0}€
              </div>
              <div className="text-blue-500 dark:text-blue-300">Panier moyen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {filteredOrders.length > 0 ? ((paidOrders / filteredOrders.length) * 100).toFixed(0) : 0}%
              </div>
              <div className="text-purple-500 dark:text-purple-300">Taux paiement</div>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucune donnée pour la période sélectionnée
            </p>
          </div>
        )}
      </div>
    </div>
  );
}