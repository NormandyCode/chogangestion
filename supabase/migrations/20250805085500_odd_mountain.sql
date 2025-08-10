/*
  # Add status column to commandes table

  1. Changes
    - Add status column to commandes table with default value 'ordered'
    - Add check constraint to ensure valid status values
*/

-- Add status column to commandes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commandes' AND column_name = 'status'
  ) THEN
    ALTER TABLE commandes ADD COLUMN status text CHECK(status IN ('ordered', 'preparing', 'delivered')) DEFAULT 'ordered';
  END IF;
END $$;