/*
  # Correction des politiques RLS pour l'upload de fichiers

  1. Corrections
    - Supprimer les anciennes politiques problématiques
    - Créer des politiques RLS fonctionnelles pour l'admin
    - Permettre l'upload et la gestion des fichiers
*/

-- Supprimer toutes les anciennes politiques sur uploaded_files
DROP POLICY IF EXISTS "Admin full access" ON uploaded_files;
DROP POLICY IF EXISTS "Public read access" ON uploaded_files;
DROP POLICY IF EXISTS "Admins can manage all files" ON uploaded_files;
DROP POLICY IF EXISTS "Everyone can read files" ON uploaded_files;

-- Créer des politiques simples et fonctionnelles
CREATE POLICY "Admin can do everything with files"
  ON uploaded_files
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'lbmickael@icloud.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'lbmickael@icloud.com'
    )
  );

-- Politique pour permettre à tous de lire (pour les téléchargements publics)
CREATE POLICY "Public can read files"
  ON uploaded_files
  FOR SELECT
  TO authenticated
  USING (true);