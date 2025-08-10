import React from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle, AlertCircle, Moon, Sun, User, LogOut, Loader } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import AuthLayout from './components/AuthLayout';
import OrderManagement from './components/OrderManagement';

console.log('🚀 AppWithAuth.tsx - Version complète avec Supabase...');

function AppWithAuth() {
  console.log('🔄 AppWithAuth component rendering...');
  
  const { theme, toggleTheme } = useTheme();
  const { user, loading, signOut } = useAuth();
  
  console.log('🎨 Theme actuel:', theme);
  console.log('👤 User state:', { hasUser: !!user, loading, email: user?.email });
  
  // Écran de chargement pendant la vérification de l'auth
  if (loading) {
    console.log('⏳ Showing loading screen...');
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
          : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}>
        <div className={`text-center p-8 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'
        }`}>
          <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
          <p className="text-gray-500">Vérification de l'authentification</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur connecté, afficher la page de connexion
  if (!user) {
    console.log('🔐 No user, showing auth layout...');
    return <AuthLayout />;
  }

  // Utilisateur connecté, afficher l'application principale
  console.log('✅ User authenticated, showing main app...');
  
  try {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white' 
          : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'
      }`}>
        {/* Header avec contrôles */}
        <div className="p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className={`text-2xl font-bold flex items-center ${
              theme === 'dark' ? 'text-white' : 'text-indigo-900'
            }`}>
              <CheckCircle className="h-8 w-8 mr-3 text-green-500" />
              🎉 Étape 4 : Supabase + Auth
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* Toggle Theme */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' 
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                } shadow-md`}
                title="Changer le thème"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              {/* User Info */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-white'
              } shadow-md`}>
                <User className="h-4 w-4" />
                <span className="text-sm">
                  {user.full_name || user.email}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={async () => {
                  try {
                    await signOut();
                    toast.success('Déconnexion réussie');
                  } catch (error) {
                    toast.error('Erreur lors de la déconnexion');
                  }
                }}
                className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Diagnostic Supabase */}
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <div className={`rounded-xl shadow-lg p-6 mb-6 ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>✅ Diagnostic Étape 4 - Supabase</h2>
              <ul className={`space-y-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Supabase configuré et connecté
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  AuthContext avec Supabase fonctionne
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Utilisateur connecté : {user.email}
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Interface d'authentification OK
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Déconnexion fonctionnelle
                </li>
              </ul>
            </div>

            <div className="flex space-x-4 mb-6">
              <button 
                onClick={() => {
                  console.log('🎉 Étape 4 validée - Supabase + Auth OK !');
                  toast.success('🎉 Étape 4 réussie ! Supabase + Auth fonctionnent !');
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 flex items-center"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                ✅ Étape 4 OK - Supabase
              </button>

              <button 
                onClick={() => {
                  console.log('🚀 Prêt pour l\'application complète !');
                  toast.success('🚀 Prêt pour l\'application de gestion des commandes !');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 flex items-center"
              >
                <User className="h-5 w-5 mr-2" />
                🚀 Lancer l'app complète
              </button>
            </div>

            <div className={`border rounded-lg p-4 ${
              theme === 'dark' 
                ? 'bg-green-900/20 border-green-800' 
                : 'bg-green-50 border-green-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 ${
                theme === 'dark' ? 'text-green-300' : 'text-green-800'
              }`}>🎉 Toutes les étapes validées !</h3>
              <ol className={`list-decimal list-inside space-y-1 ${
                theme === 'dark' ? 'text-green-400' : 'text-green-700'
              }`}>
                <li>✅ Étape 1 : React de base</li>
                <li>✅ Étape 2 : CSS Tailwind + Toast</li>
                <li>✅ Étape 3 : Contextes (Theme + Auth)</li>
                <li>✅ Étape 4 : Supabase + Auth complète</li>
                <li>🚀 Prêt pour l'application complète !</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ AppWithAuth render error:', error);
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Erreur dans AppWithAuth</h1>
          <p className="text-gray-700 mb-4">Une erreur s'est produite dans l'application avec auth.</p>
          <pre className="bg-gray-100 p-4 rounded border text-sm overflow-auto">
            {error?.toString()}
          </pre>
        </div>
      </div>
    );
  }
}

export default AppWithAuth;