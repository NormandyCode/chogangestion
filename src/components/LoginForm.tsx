import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { signIn, resetPassword } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Veuillez remplir tous les champs');
      }

      if (!validateEmail(email)) {
        throw new Error('Format d\'email invalide');
      }

      if (!validatePassword(password)) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }

      await signIn(email, password, rememberMe);
      toast.success('Connexion réussie');
    } catch (error: any) {
      // Handle specific authentication errors
      const errorMessages: { [key: string]: string } = {
        'Invalid login credentials': 'Email ou mot de passe incorrect',
        'The string did not match the expected pattern.': 'Email ou mot de passe incorrect',
        'Email not confirmed': 'Veuillez confirmer votre email',
        'Invalid email': 'Format d\'email invalide',
        'Invalid password': 'Mot de passe invalide'
      };

      const errorMessage = errorMessages[error.message] || error.message || 'Erreur de connexion';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error('Format d\'email invalide');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      toast.success('Instructions envoyées par email');
      setShowResetPassword(false);
    } catch (error: any) {
      const errorMessage = error.message === 'User not found'
        ? 'Aucun compte trouvé avec cet email'
        : error.message || 'Erreur lors de la réinitialisation';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (showResetPassword) {
    return (
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Réinitialiser le mot de passe
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="reset-email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Adresse email"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowResetPassword(false)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Retour à la connexion
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader className="animate-spin h-5 w-5" />
            ) : (
              'Envoyer les instructions'
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Connexion
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Entrez vos identifiants pour accéder à votre compte
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm -space-y-px">
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
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Se souvenir de moi
            </label>
          </div>
          <button
            type="button"
            onClick={() => setShowResetPassword(true)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Mot de passe oublié ?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <Loader className="animate-spin h-5 w-5" />
          ) : (
            'Se connecter'
          )}
        </button>
      </form>
    </div>
  );
}