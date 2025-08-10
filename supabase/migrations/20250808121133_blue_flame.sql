/*
  # Add parfum_brand column to clients table

  1. Changes
    - Add `parfum_brand` column to `clients` table
    - Column is optional (nullable) to maintain compatibility with existing data

  2. Security
    - No RLS changes needed as this is just adding a column to existing table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'parfum_brand'
  ) THEN
    ALTER TABLE clients ADD COLUMN parfum_brand text;
  END IF;
END $$;