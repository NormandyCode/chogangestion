import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../db/config';

interface SignUpFormProps {
  onSuccess: () => void;
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'request' | 'create'>('request');
  const { requestApproval, checkApprovalStatus } = useAuth();

  const handleRequestApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await requestApproval(email, password, fullName);
      toast.success('Demande d\'inscription envoyée ! Vous recevrez une confirmation une fois approuvée par l\'administrateur.');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la demande d\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Vérifier si approuvé
      const status = await checkApprovalStatus(email);
      if (!status.approved) {
        throw new Error('Votre compte n\'est pas encore approuvé par l\'administrateur');
      }

      // Créer le compte Supabase
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      toast.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const checkApproval = async () => {
    if (!email) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    setLoading(true);
    try {
      const status = await checkApprovalStatus(email);
      if (status.approved) {
        setStep('create');
        toast.success('Votre demande est approuvée ! Vous pouvez créer votre compte.');
      } else if (status.pending) {
        toast.info('Votre demande est en attente d\'approbation');
      } else {
        toast.error('Aucune demande trouvée pour cet email');
      }
    } catch (error: any) {
      toast.error('Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'create') {
    return (
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Créer votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Votre demande a été approuvée, créez votre mot de passe
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleCreateAccount}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="full-name" className="sr-only">
                Nom complet
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="appearance-none rounded-t-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Nom complet"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-50"
                  placeholder="Adresse email"
                  readOnly
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Mot de passe"
                  required
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setStep('request')}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="animate-spin h-5 w-5 mx-auto" />
              ) : (
                'Créer le compte'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Demander l'accès
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Votre demande sera examinée par l'administrateur
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleRequestApproval}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="full-name" className="sr-only">
              Nom complet
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nom complet"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email-address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Adresse email"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                required
                minLength={6}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={checkApproval}
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader className="animate-spin h-5 w-5" />
            ) : (
              'Vérifier le statut de ma demande'
            )}
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader className="animate-spin h-5 w-5" />
            ) : (
              'Demander l\'accès'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}