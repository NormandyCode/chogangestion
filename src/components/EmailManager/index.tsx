import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Send, Users, MessageSquare, X, Loader, CheckCircle, AlertCircle, Zap, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { Order } from '../../types';
import { sendBulkEmails, sendSingleEmail, EMAIL_TEMPLATES, EmailTemplate } from '../../services/emailService';
import EmailForm from './EmailForm';
import EmailPreview from './EmailPreview';

interface EmailManagerProps {
  orders: Order[];
  selectedOrders?: string[];
  onClose: () => void;
}

export default function EmailManager({ orders, selectedOrders = [], onClose }: EmailManagerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof EMAIL_TEMPLATES>('orderConfirmation');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [useCustomMessage, setUseCustomMessage] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  // Filtrer les commandes avec email
  const ordersWithEmail = orders.filter(order => order.email);
  
  // Initialiser les destinataires sélectionnés
  React.useEffect(() => {
    if (selectedOrders.length > 0) {
      // Seulement sélectionner les commandes passées en paramètre
      const initialSelection = orders
        .filter(order => selectedOrders.includes(order.id) && order.email)
        .map(order => order.id);
      setSelectedRecipients(initialSelection);
    } else {
      // Ne rien sélectionner par défaut
      setSelectedRecipients([]);
    }
  }, [selectedOrders, orders]);

  const ordersToSend = ordersWithEmail.filter(order => selectedRecipients.includes(order.id));

  const handleToggleRecipient = (orderId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecipients.length === ordersWithEmail.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(ordersWithEmail.map(order => order.id));
    }
  };

  const handleSendEmails = async () => {
    if (ordersToSend.length === 0) {
      toast.error('Aucune commande avec email sélectionnée');
      return;
    }

    setSending(true);
    setResults(null);
    setProgress({ current: 0, total: ordersToSend.length });

    try {
      const template: EmailTemplate = useCustomMessage 
        ? { subject: customSubject, message: customMessage }
        : EMAIL_TEMPLATES[selectedTemplate];

      const result = await sendBulkEmails(
        ordersToSend,
        template,
        (current, total) => setProgress({ current, total })
      );

      setResults(result);
      
      if (result.success > 0) {
        toast.success(`${result.success} email(s) envoyé(s) avec succès`);
      }
      
      if (result.failed > 0) {
        toast.error(`${result.failed} email(s) ont échoué`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi des emails');
    } finally {
      setSending(false);
    }
  };

  const handleSendSingleEmail = async (order: Order) => {
    try {
      const template: EmailTemplate = useCustomMessage 
        ? { subject: customSubject, message: customMessage }
        : EMAIL_TEMPLATES[selectedTemplate];

      await sendSingleEmail(order, template);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'email');
    }
  };

  const ordersWithoutEmail = orders.filter(o => !o.email).length;
  const selectedOrdersWithEmail = selectedOrders.length > 0 ? selectedOrders.length : orders.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <Mail className="h-6 w-6 mr-3" />
                  Gestion des Emails
                </h2>
                <p className="mt-1 opacity-90">Envoyez des emails personnalisés à vos clients</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{ordersWithEmail.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Disponibles</div>
                </div>
                <Mail className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{selectedRecipients.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sélectionnées</div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">{ordersWithoutEmail}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sans email</div>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {results ? results.success : 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Envoyés</div>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
              <EmailForm
                selectedTemplate={selectedTemplate}
                onTemplateChange={setSelectedTemplate}
                customSubject={customSubject}
                onSubjectChange={setCustomSubject}
                customMessage={customMessage}
                onMessageChange={setCustomMessage}
                useCustomMessage={useCustomMessage}
                onUseCustomChange={setUseCustomMessage}
                disabled={sending}
              />

              {/* Actions */}
              <div className="mt-6 space-y-4">
                <button
                  onClick={handleSendEmails}
                  disabled={sending || ordersToSend.length === 0}
                  className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {sending ? (
                    <>
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Envoi en cours... ({progress.current}/{progress.total})
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Envoyer à {ordersToSend.length} client(s)
                    </>
                  )}
                </button>

                {/* Barre de progression */}
                {sending && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    ></div>
                  </div>
                )}

                {/* Résultats */}
                {results && (
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Résultats de l'envoi
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Succès
                        </div>
                        <span className="font-bold text-green-700 dark:text-green-400">
                          {results.success}
                        </span>
                      </div>
                      {results.failed > 0 && (
                        <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <div className="flex items-center text-red-600">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Échecs
                          </div>
                          <span className="font-bold text-red-700 dark:text-red-400">
                            {results.failed}
                          </span>
                        </div>
                      )}
                      {results.errors.length > 0 && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                            Voir les erreurs détaillées
                          </summary>
                          <div className="mt-2 text-xs text-red-600 dark:text-red-400 space-y-1 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                            {results.errors.map((error, index) => (
                              <div key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{error}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Aperçu */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
              <EmailPreview
                template={useCustomMessage 
                  ? { subject: customSubject, message: customMessage }
                  : EMAIL_TEMPLATES[selectedTemplate]
                }
                sampleOrder={ordersToSend[0]}
              />
            </div>
          </div>

          {/* Liste des commandes */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Sélection des destinataires ({ordersWithEmail.length} disponibles)
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedRecipients.length} sélectionné(s)
                </span>
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                >
                  {selectedRecipients.length === ordersWithEmail.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                </button>
              </div>
            </div>
            
            {ordersWithEmail.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Aucune commande avec email trouvée
                </p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                <div className="space-y-3">
                  {ordersWithEmail.map((order) => (
                    <div
                      key={order.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                        selectedRecipients.includes(order.id)
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 shadow-md'
                          : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:shadow-md hover:bg-gray-100 dark:hover:bg-slate-600'
                      }`}
                      onClick={() => handleToggleRecipient(order.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          selectedRecipients.includes(order.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 dark:border-gray-500'
                        }`}>
                          {selectedRecipients.includes(order.id) && (
                            <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {order.customerName}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.isPaid 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {order.isPaid ? 'Payée' : 'Non payée'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-4">
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {order.email}
                          </span>
                          <span>•</span>
                          <span>{order.invoiceNumber}</span>
                          <span>•</span>
                          <span className="font-medium">{order.totalAmount.toFixed(2)}€</span>
                        </div>
                      </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendSingleEmail(order);
                        }}
                        disabled={sending}
                        className="ml-4 p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Envoyer email individuel"
                      >
                        <Zap className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}