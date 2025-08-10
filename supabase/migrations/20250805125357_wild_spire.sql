/*
  # Système de gestion de fichiers

  1. Nouvelles tables
    - uploaded_files (fichiers uploadés par l'admin)
    
  2. Sécurité
    - RLS activé avec politiques pour l'admin uniquement
*/

-- Créer la table des fichiers uploadés
CREATE TABLE IF NOT EXISTS uploaded_files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename text NOT NULL,
  original_filename text NOT NULL,
  display_name text NOT NULL,
  category text NOT NULL CHECK(category IN ('documents', 'logos')),
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  uploaded_by uuid REFERENCES auth.users(id),
  uploaded_at timestamptz DEFAULT now() NOT NULL
);

-- Activer RLS
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux admins de tout faire
CREATE POLICY "Admins can manage all files"
  ON uploaded_files
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Politique pour permettre à tous de lire les fichiers (pour les téléchargements)
CREATE POLICY "Everyone can read files"
  ON uploaded_files
  FOR SELECT
  USING (true);