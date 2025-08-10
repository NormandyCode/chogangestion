/*
  # Ajouter la colonne status à la table commandes

  1. Modifications
    - Ajouter la colonne status à la table commandes avec une valeur par défaut 'ordered'
    - Ajouter une contrainte de vérification pour les valeurs valides
*/

-- Ajouter la colonne status si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commandes' AND column_name = 'status'
  ) THEN
    ALTER TABLE commandes ADD COLUMN status text CHECK(status IN ('ordered', 'preparing', 'delivered')) DEFAULT 'ordered';
  END IF;
END $$;

-- Mettre à jour les enregistrements existants qui n'ont pas de status
UPDATE commandes SET status = 'ordered' WHERE status IS NULL;