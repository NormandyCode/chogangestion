import React from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle, AlertCircle, Moon, Sun, User, LogOut } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';

console.log('🚀 App.tsx - Étape 3: Version avec Contextes...');

function App() {
  console.log('🔄 App component avec contextes rendering...');
  
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();
  
  console.log('🎨 Theme actuel:', theme);
  console.log('👤 User state:', { hasUser: !!user, loading });
  
  try {
    return (
      <div className={`min-h-screen transition-colors duration-300 p-8 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white' 
          : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'
      }`}>
        <div className="max-w-4xl mx-auto">
          {/* Header avec contrôles */}
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-4xl font-bold mb-0 flex items-center ${
              theme === 'dark' ? 'text-white' : 'text-indigo-900'
            }`}>
              <CheckCircle className="h-10 w-10 mr-4 text-green-500" />
              🎉 Application Progressive - Étape 3
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* Toggle Theme */}
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' 
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                } shadow-md`}
                title="Changer le thème"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              {/* User Info */}
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-white'
              } shadow-md`}>
                <User className="h-5 w-5" />
                <span className="text-sm">
                  {loading ? 'Chargement...' : user ? user.email : 'Non connecté'}
                </span>
              </div>
            </div>
          </div>
        
          <div className={`rounded-xl shadow-lg p-6 mb-6 ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          }`}>
            <h2 className={`text-2xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>✅ Diagnostic Étape 3</h2>
            <ul className={`space-y-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              React se charge correctement
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              App.tsx fonctionne
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              CSS Tailwind chargé
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Icônes Lucide React OK
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              React Hot Toast intégré
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ThemeContext fonctionne (thème: {theme})
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              AuthContext fonctionne (loading: {loading ? 'oui' : 'non'})
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Mode sombre/clair disponible
            </li>
          </ul>
          </div>
        
          <div className="flex space-x-4 mb-6">
            <button 
              onClick={() => {
                console.log('🎉 Étape 3 validée - Contextes OK !');
                toast.success('🎉 Étape 3 réussie ! ThemeContext + AuthContext fonctionnent !');
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 flex items-center"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              ✅ Étape 3 OK - Contextes
            </button>
        
            <button 
              onClick={() => {
                toggleTheme();
                toast.success(`🎨 Thème changé vers ${theme === 'dark' ? 'clair' : 'sombre'} !`);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 flex items-center"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 mr-2" /> : <Moon className="h-5 w-5 mr-2" />}
              🎨 Changer Thème
            </button>
            
            <button 
              onClick={() => {
                console.log('⚠️ Test d\'erreur pour vérifier les toasts');
                toast.error('🔥 Test d\'erreur - Toast fonctionne !');
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 flex items-center"
            >
              <AlertCircle className="h-5 w-5 mr-2" />
              🔥 Tester Erreur
            </button>
          </div>
        
          <div className={`mt-8 border rounded-lg p-4 ${
            theme === 'dark' 
              ? 'bg-blue-900/20 border-blue-800' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
            }`}>🔍 Prochaines étapes :</h3>
            <ol className={`list-decimal list-inside space-y-1 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
            }`}>
              <li>✅ Étape 3 : Contextes (Theme + Auth) - EN COURS</li>
              <li>Étape 4 : Intégrer Supabase</li>
              <li>Étape 5 : Composants complets</li>
            </ol>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ App render error:', error);
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Erreur dans App</h1>
          <p className="text-gray-700 mb-4">Une erreur s'est produite dans le composant App.</p>
          <pre className="bg-gray-100 p-4 rounded border text-sm overflow-auto">
            {error?.toString()}
          </pre>
        </div>
      </div>
    );
  }
}

export default App;