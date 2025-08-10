/*
  # Système d'upload de fichiers - Redémarrage propre

  1. Suppression complète
    - Supprimer la table uploaded_files existante
    - Supprimer toutes les politiques RLS associées
    
  2. Recréation propre
    - Nouvelle table uploaded_files sans RLS
    - Structure simple et fonctionnelle
    
  3. Pas de restrictions
    - Accès libre pour l'admin
    - Pas de politiques RLS compliquées
*/

-- Supprimer complètement l'ancienne table et ses politiques
DROP TABLE IF EXISTS uploaded_files CASCADE;

-- Recréer la table de façon propre
CREATE TABLE uploaded_files (
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

-- Pas de RLS du tout pour éviter les problèmes
ALTER TABLE uploaded_files DISABLE ROW LEVEL SECURITY;

-- Index pour les performances
CREATE INDEX idx_uploaded_files_category ON uploaded_files(category);
CREATE INDEX idx_uploaded_files_uploaded_at ON uploaded_files(uploaded_at DESC);