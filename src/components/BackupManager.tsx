import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Download, Upload, Database, FileText, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Order } from '../types';
import * as XLSX from 'xlsx';

interface BackupManagerProps {
  orders: Order[];
}

export default function BackupManager({ orders }: BackupManagerProps) {
  const [importing, setImporting] = useState(false);
  const [backupStats, setBackupStats] = useState({
    totalOrders: 0,
    totalClients: 0,
    totalProducts: 0,
    lastBackup: null as string | null
  });

  React.useEffect(() => {
    calculateStats();
    loadLastBackupDate();
  }, [orders]);

  const calculateStats = () => {
    const uniqueClients = new Set(orders.map(o => o.customerName.toLowerCase())).size;
    const uniqueProducts = new Set();
    orders.forEach(order => {
      order.products.forEach(product => {
        uniqueProducts.add(product.reference);
      });
    });

    setBackupStats({
      totalOrders: orders.length,
      totalClients: uniqueClients,
      totalProducts: uniqueProducts.size,
      lastBackup: localStorage.getItem('lastBackupDate')
    });
  };

  const loadLastBackupDate = () => {
    const lastBackup = localStorage.getItem('lastBackupDate');
    if (lastBackup) {
      setBackupStats(prev => ({ ...prev, lastBackup }));
    }
  };

  const exportFullBackup = () => {
    try {
      // Feuille 1: Commandes
      const ordersData = [
        ['ID', 'Client', 'Adresse', 'Email', 'Téléphone', 'N° Facture', 'Montant', 'Date', 'Payé', 'Mode Paiement', 'Statut', 'Produits'],
        ...orders.map(order => [
          order.id,
          order.customerName,
          order.address,
          order.email || '',
          order.phone || '',
          order.invoiceNumber,
          order.totalAmount,
          order.date,
          order.isPaid ? 'Oui' : 'Non',
          order.paymentMethod || '',
          order.status,
          order.products.map(p => `${p.name} (${p.reference})`).join('; ')
        ])
      ];

      // Feuille 2: Clients uniques
      const clientsMap = new Map();
      orders.forEach(order => {
        const key = order.customerName.toLowerCase();
        if (!clientsMap.has(key)) {
          clientsMap.set(key, {
            name: order.customerName,
            address: order.address,
            email: order.email,
            phone: order.phone,
            orders: 0,
            totalSpent: 0
          });
        }
        const client = clientsMap.get(key);
        client.orders++;
        client.totalSpent += order.totalAmount;
      });

      const clientsData = [
        ['Nom', 'Adresse', 'Email', 'Téléphone', 'Nb Commandes', 'Total Dépensé'],
        ...Array.from(clientsMap.values()).map(client => [
          client.name,
          client.address,
          client.email || '',
          client.phone || '',
          client.orders,
          client.totalSpent.toFixed(2)
        ])
      ];

      // Feuille 3: Produits uniques
      const productsMap = new Map();
      orders.forEach(order => {
        order.products.forEach(product => {
          const key = product.reference;
          if (!productsMap.has(key)) {
            productsMap.set(key, {
              name: product.name,
              reference: product.reference,
              brand: product.parfumBrand,
              orderCount: 0
            });
          }
          productsMap.get(key).orderCount++;
        });
      });

      const productsData = [
        ['Nom', 'Référence', 'Marque', 'Nb Commandes'],
        ...Array.from(productsMap.values()).map(product => [
          product.name,
          product.reference,
          product.brand || '',
          product.orderCount
        ])
      ];

      // Créer le workbook
      const wb = XLSX.utils.book_new();
      
      const wsOrders = XLSX.utils.aoa_to_sheet(ordersData);
      const wsClients = XLSX.utils.aoa_to_sheet(clientsData);
      const wsProducts = XLSX.utils.aoa_to_sheet(productsData);
      
      XLSX.utils.book_append_sheet(wb, wsOrders, 'Commandes');
      XLSX.utils.book_append_sheet(wb, wsClients, 'Clients');
      XLSX.utils.book_append_sheet(wb, wsProducts, 'Produits');

      // Sauvegarder
      const fileName = `sauvegarde-complete-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      // Enregistrer la date de sauvegarde
      const now = new Date().toISOString();
      localStorage.setItem('lastBackupDate', now);
      setBackupStats(prev => ({ ...prev, lastBackup: now }));
      
      toast.success('Sauvegarde complète exportée !');
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  const exportOrdersOnly = () => {
    try {
      const data = [
        ['Client', 'Adresse', 'Email', 'Téléphone', 'N° Facture', 'Montant', 'Date', 'Payé', 'Mode Paiement', 'Statut', 'Produits'],
        ...orders.map(order => [
          order.customerName,
          order.address,
          order.email || '',
          order.phone || '',
          order.invoiceNumber,
          order.totalAmount,
          order.date,
          order.isPaid ? 'Oui' : 'Non',
          order.paymentMethod || '',
          order.status,
          order.products.map(p => `${p.name} (${p.reference})`).join('; ')
        ])
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Commandes');
      
      const fileName = `commandes-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success('Commandes exportées !');
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Analyser les données importées
      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as any[][];

      console.log('Données importées:', {
        headers,
        rowCount: rows.length,
        sample: rows.slice(0, 3)
      });

      toast.success(`${rows.length} lignes détectées dans le fichier`);
      toast.info('Fonctionnalité d\'import en cours de développement');
      
    } catch (error) {
      console.error('Erreur import:', error);
      toast.error('Erreur lors de l\'import du fichier');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const generateTemplate = () => {
    const templateData = [
      ['Client', 'Adresse', 'Email', 'Téléphone', 'N° Facture', 'Montant', 'Date', 'Payé', 'Mode Paiement', 'Statut', 'Produits'],
      ['Jean Dupont', '123 rue Example, Paris', 'jean@example.com', '0612345678', 'FACT001', '150.00', '2024-01-15', 'Oui', 'card', 'delivered', 'Parfum Homme (PH001); Eau de Toilette (EDT001)'],
      ['Marie Martin', '456 avenue Test, Lyon', 'marie@example.com', '0698765432', 'FACT002', '89.50', '2024-01-16', 'Non', '', 'ordered', 'Parfum Femme (PF001)']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    XLSX.writeFile(wb, 'template-import-commandes.xlsx');
    toast.success('Template d\'import téléchargé !');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Database className="h-6 w-6 mr-3 text-gray-600" />
          Sauvegarde & Import
        </h2>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{backupStats.totalOrders}</div>
          <div className="text-sm text-blue-500">Commandes</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{backupStats.totalClients}</div>
          <div className="text-sm text-green-500">Clients uniques</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{backupStats.totalProducts}</div>
          <div className="text-sm text-purple-500">Produits uniques</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
          <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
            {backupStats.lastBackup 
              ? new Date(backupStats.lastBackup).toLocaleDateString('fr-FR')
              : 'Jamais'
            }
          </div>
          <div className="text-sm text-gray-500">Dernière sauvegarde</div>
        </div>
      </div>

      {/* Export */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Download className="h-5 w-5 mr-2 text-green-600" />
          Export / Sauvegarde
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={exportFullBackup}
            className="flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Database className="h-5 w-5 mr-2" />
            <div className="text-left">
              <div className="font-medium">Sauvegarde Complète</div>
              <div className="text-sm opacity-90">Commandes + Clients + Produits</div>
            </div>
          </button>
          
          <button
            onClick={exportOrdersOnly}
            className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="h-5 w-5 mr-2" />
            <div className="text-left">
              <div className="font-medium">Commandes Uniquement</div>
              <div className="text-sm opacity-90">Export simple des commandes</div>
            </div>
          </button>
        </div>
      </div>

      {/* Import */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Upload className="h-5 w-5 mr-2 text-orange-600" />
          Import de données
        </h3>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-800 dark:text-orange-200">
              <p className="font-medium mb-1">Fonctionnalité en développement</p>
              <p>L'import de données sera bientôt disponible. Utilisez le template pour préparer vos données.</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block w-full">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileImport}
                disabled={importing}
                className="hidden"
              />
              <div className={`flex items-center justify-center px-6 py-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                importing 
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                  : 'border-orange-300 bg-orange-50 hover:bg-orange-100'
              }`}>
                {importing ? (
                  <RefreshCw className="h-5 w-5 mr-2 text-gray-500 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5 mr-2 text-orange-600" />
                )}
                <div className="text-center">
                  <div className="font-medium text-gray-700">
                    {importing ? 'Import en cours...' : 'Importer un fichier'}
                  </div>
                  <div className="text-sm text-gray-500">Excel, CSV</div>
                </div>
              </div>
            </label>
          </div>
          
          <button
            onClick={generateTemplate}
            className="flex items-center justify-center px-6 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FileText className="h-5 w-5 mr-2" />
            <div className="text-left">
              <div className="font-medium">Télécharger Template</div>
              <div className="text-sm opacity-90">Format d'import Excel</div>
            </div>
          </button>
        </div>
      </div>

      {/* Conseils */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" />
          Conseils de sauvegarde
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Effectuez une sauvegarde complète chaque semaine</li>
          <li>• Conservez plusieurs versions de sauvegarde</li>
          <li>• Testez vos sauvegardes régulièrement</li>
          <li>• Stockez les sauvegardes dans un lieu sûr (cloud, disque externe)</li>
        </ul>
      </div>
    </div>
  );
}