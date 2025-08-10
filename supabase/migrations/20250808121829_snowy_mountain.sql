/*
  # Ajouter la colonne parfum_brand à la table produits

  1. Modifications
    - Ajouter la colonne parfum_brand à la table produits
    - Supprimer la colonne parfum_brand de la table clients (si elle existe)
*/

-- Ajouter la colonne parfum_brand à la table produits si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'produits' AND column_name = 'parfum_brand'
  ) THEN
    ALTER TABLE produits ADD COLUMN parfum_brand text;
  END IF;
END $$;

-- Supprimer la colonne parfum_brand de la table clients si elle existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'parfum_brand'
  ) THEN
    ALTER TABLE clients DROP COLUMN parfum_brand;
  END IF;
END $$;