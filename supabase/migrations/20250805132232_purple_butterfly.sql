/*
  # Correction des politiques Storage pour bucket public

  1. Suppression des anciennes politiques
  2. Création de nouvelles politiques pour le bucket files
  3. Permettre l'upload et la lecture pour l'admin
*/

-- Supprimer toutes les anciennes politiques sur storage.objects
DROP POLICY IF EXISTS "Admin full access to files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload files" ON storage.objects;

-- Politique pour permettre à l'admin d'uploader dans le bucket files
CREATE POLICY "Admin can upload to files bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'files' 
  AND (SELECT email FROM auth.users WHERE id = auth.uid()) = 'lbmickael@icloud.com'
);

-- Politique pour permettre à l'admin de lire les fichiers
CREATE POLICY "Admin can read files bucket"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'files' 
  AND (SELECT email FROM auth.users WHERE id = auth.uid()) = 'lbmickael@icloud.com'
);

-- Politique pour permettre à l'admin de supprimer les fichiers
CREATE POLICY "Admin can delete from files bucket"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'files' 
  AND (SELECT email FROM auth.users WHERE id = auth.uid()) = 'lbmickael@icloud.com'
);

-- Politique pour permettre la lecture publique (pour les téléchargements)
CREATE POLICY "Public can read files bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'files');