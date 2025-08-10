import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  requestApproval: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkApprovalStatus: (email: string) => Promise<{ approved: boolean; pending: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  console.log('🔐 AuthProvider rendering...', { user: !!user, loading });

  // Fonction pour vérifier périodiquement le statut d'approbation
  useEffect(() => {
    if (!user) return;
    
    // Ne pas vérifier le statut pour l'admin
    if (user.email === 'lbmickael@icloud.com') return;

    const checkUserStatus = async () => {
      try {
        const { supabase } = await import('../db/config');
        
        const { data, error } = await supabase
          .from('user_approvals')
          .select('approved')
          .eq('email', user.email)
          .eq('approved', true)
          .single();

        // Si l'utilisateur n'est plus approuvé, le déconnecter
        if (error || !data) {
          toast.error('Votre accès a été révoqué par l\'administrateur');
          await signOut();
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
      }
    };

    // Vérifier le statut toutes les 30 secondes
    const interval = setInterval(checkUserStatus, 30000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    console.log('🔍 AuthProvider useEffect - checking user status...');
    // Check for existing Supabase session
    const checkSession = async () => {
    console.log('🔍 AuthProvider useEffect - checking session...');
      try {
        console.log('🔄 Checking user approval status...');
        const { supabase } = await import('../db/config');
        console.log('📡 Importing Supabase config...');
        
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 Getting session...', { hasSession: !!session });
        
        if (session?.user) {
          console.log('✅ Session found, setting user...');
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || ''
          });
        } else {
          console.log('❌ No session found');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        
        // Handle invalid refresh token errors
        if (error instanceof Error && 
            (error.message.includes('Invalid Refresh Token') || 
             error.message.includes('refresh_token_not_found'))) {
          console.log('🔄 Invalid refresh token detected, clearing session...');
          try {
            const { supabase } = await import('../db/config');
            await supabase.auth.signOut();
            setUser(null);
          } catch (signOutError) {
            console.error('Error signing out:', signOutError);
          }
        }
      } finally {
        console.log('✅ Auth check complete, setting loading to false');
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const { supabase } = await import('../db/config');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Si l'utilisateur n'existe pas, vérifier s'il a une demande approuvée
        if (error.message.includes('Invalid login credentials')) {
          const { data: approval, error: approvalError } = await supabase
            .from('user_approvals')
            .select('approved')
            .eq('email', email)
            .eq('approved', true)
            .single();

          if (approvalError || !approval) {
            throw new Error('Votre compte n\'est pas encore approuvé par l\'administrateur ou vous devez d\'abord créer votre compte');
          }
          
          throw new Error('Votre compte est approuvé mais vous devez d\'abord créer votre mot de passe. Utilisez "Mot de passe oublié" pour définir votre mot de passe.');
        }
        throw new Error(error.message);
      }

      // Vérifier si l'utilisateur est approuvé après connexion réussie (sauf pour l'admin)
      if (email !== 'lbmickael@icloud.com') {
        const { data: approval } = await supabase
          .from('user_approvals')
          .select('approved')
          .eq('email', email)
          .eq('approved', true)
          .single();

        if (!approval || !approval.approved) {
          await supabase.auth.signOut();
          throw new Error('Votre accès a été révoqué par l\'administrateur');
        }
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || ''
        });
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erreur de connexion');
    }
  };

  const requestApproval = async (email: string, password: string, fullName: string) => {
    try {
      const { supabase } = await import('../db/config');
      
      // Vérifier si une demande existe déjà
      const { data: existingRequest } = await supabase
        .from('user_approvals')
        .select('*')
        .eq('email', email)
        .single();

      if (existingRequest) {
        if (existingRequest.approved) {
          throw new Error('Votre compte est déjà approuvé. Vous pouvez vous connecter.');
        } else {
          throw new Error('Une demande d\'inscription est déjà en attente pour cet email.');
        }
      }

      // Créer une demande d'approbation
      const { error } = await supabase
        .from('user_approvals')
        .insert({
          email,
          full_name: fullName
        });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la demande d\'inscription');
    }
  };

  const checkApprovalStatus = async (email: string) => {
    try {
      const { supabase } = await import('../db/config');
      
      const { data, error } = await supabase
        .from('user_approvals')
        .select('approved')
        .eq('email', email)
        .single();

      if (error) {
        return { approved: false, pending: false };
      }

      return {
        approved: data.approved,
        pending: !data.approved
      };
    } catch (error) {
      return { approved: false, pending: false };
    }
  };

  const createUserAccount = async (email: string, password: string, fullName: string) => {
    try {
      const { supabase } = await import('../db/config');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.user;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la création du compte');
    }
  };

  const signOut = async () => {
    const { supabase } = await import('../db/config');
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { supabase } = await import('../db/config');
      
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la réinitialisation');
    }
  };

  const value = {
    user,
    loading,
    signIn,
    requestApproval,
    signOut,
    resetPassword,
    checkApprovalStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé avec AuthProvider');
  }
  return context;
}