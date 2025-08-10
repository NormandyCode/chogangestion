/*
  # Système de validation d'inscription par l'administrateur

  1. Nouvelles tables
    - user_approvals (demandes d'inscription en attente)
    
  2. Modifications
    - Ajouter une colonne approved à auth.users via metadata
    
  3. Sécurité
    - Politiques pour gérer les approbations
*/

-- Créer la table des demandes d'approbation
CREATE TABLE IF NOT EXISTS user_approvals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  requested_at timestamptz DEFAULT now() NOT NULL,
  approved boolean DEFAULT false,
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Activer RLS sur la table user_approvals
ALTER TABLE user_approvals ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres demandes
CREATE POLICY "Users can view their own approval requests"
  ON user_approvals FOR SELECT
  USING (email = auth.jwt() ->> 'email');

-- Politique pour permettre l'insertion de nouvelles demandes
CREATE POLICY "Anyone can request approval"
  ON user_approvals FOR INSERT
  WITH CHECK (true);

-- Fonction pour vérifier si un utilisateur est administrateur
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  -- Remplacez cette email par votre email d'administrateur
  RETURN auth.jwt() ->> 'email' = 'lbmickael@icloud.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politique pour permettre aux admins de voir toutes les demandes
CREATE POLICY "Admins can view all approval requests"
  ON user_approvals FOR SELECT
  USING (is_admin());

-- Politique pour permettre aux admins de mettre à jour les demandes
CREATE POLICY "Admins can update approval requests"
  ON user_approvals FOR UPDATE
  USING (is_admin());