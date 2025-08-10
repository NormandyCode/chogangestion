import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

export default function AuthLayout() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="logo.png" 
            alt="Logo Gestion des Commandes" 
            className="h-35 w-35"
          />
        </div>
        
        {isLogin ? (
          <>
            <LoginForm />
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  S'inscrire
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <SignUpForm onSuccess={() => setIsLogin(true)} />
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Se connecter
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}