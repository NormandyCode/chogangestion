import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Users, Trash2, Files } from 'lucide-react';
import { supabase } from '../db/config';
import FileUploadManager from './FileUploadManager';

interface ApprovalRequest {
  id: string;
  email: string;
  full_name: string;
  requested_at: string;
  approved: boolean;
}

export default function AdminPanel() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'files'>('users');

  useEffect(() => {
    loadApprovalRequests();
  }, []);

  const loadApprovalRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_approvals')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement:', error);
        throw error;
      }
      
      console.log('Demandes chargées:', data?.length || 0);
      setRequests(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (request: ApprovalRequest) => {
    try {
      // Marquer la demande comme approuvée
      const { error: updateError } = await supabase
        .from('user_approvals')
        .update({
          approved: true,
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      toast.success(`Utilisateur ${request.email} approuvé avec succès`);
      loadApprovalRequests();
    } catch (error: any) {
      console.error('Erreur lors de l\'approbation:', error);
      toast.error('Erreur lors de l\'approbation de l\'utilisateur');
    }
  };

  const rejectUser = async (requestId: string) => {
    try {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir rejeter cette demande ?');
      if (!confirmed) return;

      // Récupérer les détails de la demande avant suppression
      const requestToReject = requests.find(r => r.id === requestId);
      if (!requestToReject) {
        toast.error('Demande introuvable');
        return;
      }

      console.log('Suppression de la demande:', requestId, requestToReject.email);

      const { error } = await supabase
        .from('user_approvals')
        .delete()
        .eq('id', requestId);

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      // Forcer la déconnexion de l'utilisateur
      await forceUserDisconnect(requestToReject.email);
      
      toast.success(`Demande de ${requestToReject.email} rejetée avec succès`);
      await loadApprovalRequests();
    } catch (error) {
      console.error('Erreur lors du rejet de la demande:', error);
      toast.error(`Erreur lors du rejet: ${error.message || 'Erreur inconnue'}`);
    }
  };

  const removeUser = async (request: ApprovalRequest) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${request.email} ? Cette action est irréversible.`)) {
      return;
    }

    try {
      // Marquer l'utilisateur comme supprimé au lieu de le supprimer complètement
      const { error: updateError } = await supabase
        .from('user_approvals')
        .update({
          approved: false,
          approved_at: null,
          approved_by: null
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Optionnel : supprimer complètement la demande
      const { error: deleteRequestError } = await supabase
        .from('user_approvals')
        .delete()
        .eq('id', request.id);

      if (deleteRequestError) throw deleteRequestError;

      // Forcer la déconnexion de l'utilisateur
      await forceUserDisconnect(request.email);
      toast.success(`Utilisateur ${request.email} supprimé avec succès`);
      loadApprovalRequests();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const forceUserDisconnect = async (email: string) => {
    try {
      // Ne pas déconnecter l'admin
      if (email === 'lbmickael@icloud.com') return;
      
      console.log('Déconnexion forcée pour:', email);
      
      // Créer un événement personnalisé pour forcer la déconnexion
      const event = new CustomEvent('forceLogout', { 
        detail: { email } 
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Erreur lors de la déconnexion forcée:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => !r.approved);
  const approvedRequests = requests.filter(r => r.approved);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Users className="h-8 w-8 mr-3 text-indigo-600" />
          Panneau d'administration
        </h1>
        <p className="mt-2 text-gray-600">
          Gérez les utilisateurs et les fichiers du système
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-slate-600">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <Users className="h-5 w-5 inline mr-2" />
              Gestion des utilisateurs
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'files'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <Files className="h-5 w-5 inline mr-2" />
              Gestion des fichiers
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'files' && <FileUploadManager />}

      {activeTab === 'users' && (
        <>
      {/* Demandes en attente */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-orange-500" />
          Demandes en attente ({pendingRequests.length})
        </h2>
        
        {pendingRequests.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500">Aucune demande en attente</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de demande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(request.requested_at).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveUser(request)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approuver
                        </button>
                        <button
                          onClick={() => rejectUser(request.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeter
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Utilisateurs approuvés */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
          Utilisateurs approuvés ({approvedRequests.length})
        </h2>
        
        {approvedRequests.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500">Aucun utilisateur approuvé</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'approbation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {approvedRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.approved_at ? new Date(request.approved_at).toLocaleDateString('fr-FR') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => removeUser(request)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}