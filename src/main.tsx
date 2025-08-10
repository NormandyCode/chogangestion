import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import OrderManagement from './components/OrderManagement';
import AuthLayout from './components/AuthLayout';
import { useAuth } from './contexts/AuthContext';
import { Loader } from 'lucide-react';

console.log('🚀 Main.tsx - Étape 5: Application complète...');

function AppRouter() {
  const { user, loading } = useAuth();
  
  console.log('🔄 AppRouter rendering...', { hasUser: !!user, loading });
  
  if (loading) {
    console.log('⏳ Showing loading screen...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center p-8 rounded-xl shadow-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
          <p className="text-gray-500">Vérification de l'authentification</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🔐 No user, showing auth layout...');
    return <AuthLayout />;
  }

  console.log('✅ User authenticated, showing order management...');
  return <OrderManagement />;
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<h1 style="color: red;">❌ Root element not found!</h1>';
} else {
  console.log('✅ Root element found');
  
  try {
    console.log('🔍 Creating React root with complete app...');
    const root = createRoot(rootElement);
    
    console.log('🔍 Rendering complete application...');
    root.render(
      <StrictMode>
        <ThemeProvider>
          <AuthProvider>
            <AppRouter />
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </StrictMode>
    );
    console.log('✅ Complete application rendered successfully');
  } catch (error) {
    console.error('❌ Error during complete app render:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: Arial; background: #fee; min-height: 100vh;">
        <h1>❌ Erreur de rendu de l'application complète</h1>
        <p>Erreur détectée :</p>
        <pre style="background: white; padding: 10px; border: 1px solid #ccc; margin: 10px 0;">${error?.toString()}</pre>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Recharger la page
        </button>
      </div>
    `;
  }
}