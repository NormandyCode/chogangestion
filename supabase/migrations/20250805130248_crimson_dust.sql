/*
  # Correction des politiques RLS pour l'upload de fichiers

  1. Corrections
    - Supprimer les anciennes politiques problématiques
    - Créer des politiques RLS plus simples et fonctionnelles
    - Permettre l'upload pour l'administrateur
*/

-- Supprimer toutes les anciennes politiques sur uploaded_files
DROP POLICY IF EXISTS "Admins can manage all files" ON uploaded_files;
DROP POLICY IF EXISTS "Admin can manage files" ON uploaded_files;
DROP POLICY IF EXISTS "Everyone can read files" ON uploaded_files;

-- Désactiver temporairement RLS pour tester
ALTER TABLE uploaded_files DISABLE ROW LEVEL SECURITY;

-- Réactiver RLS avec des politiques plus simples
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Politique simple pour l'admin (basée sur l'email directement)
CREATE POLICY "Admin full access" ON uploaded_files
  FOR ALL
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'lbmickael@icloud.com'
  )
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'lbmickael@icloud.com'
  );

-- Politique pour permettre à tous de lire (pour les téléchargements publics)
CREATE POLICY "Public read access" ON uploaded_files
  FOR SELECT
  USING (true);