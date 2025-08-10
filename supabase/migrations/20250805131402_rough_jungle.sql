/*
  # Solution finale pour corriger RLS sur uploaded_files

  1. Corrections
    - Supprimer toutes les politiques problématiques
    - Désactiver complètement RLS sur uploaded_files
    - Permettre l'accès depuis n'importe quel appareil
*/

-- Supprimer toutes les politiques existantes sur uploaded_files
DROP POLICY IF EXISTS "Admin can do everything with files" ON uploaded_files;
DROP POLICY IF EXISTS "Public can read files" ON uploaded_files;
DROP POLICY IF EXISTS "Admin full access" ON uploaded_files;
DROP POLICY IF EXISTS "Public read access" ON uploaded_files;
DROP POLICY IF EXISTS "Admins can manage all files" ON uploaded_files;
DROP POLICY IF EXISTS "Everyone can read files" ON uploaded_files;

-- Désactiver complètement RLS sur cette table
ALTER TABLE uploaded_files DISABLE ROW LEVEL SECURITY;

-- Vérifier que la table existe avec la bonne structure
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