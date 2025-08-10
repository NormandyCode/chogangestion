/*
  # Fix Product Deletion Policy

  1. Security Changes
    - Update RLS policy to allow authenticated users to delete any product
    - This fixes the issue where products without user_id cannot be deleted

  2. Changes Made
    - Drop the restrictive delete policy for produits
    - Create a new policy that allows any authenticated user to delete products
*/

-- Drop the existing restrictive delete policy
DROP POLICY IF EXISTS "Users can delete their own products" ON produits;

-- Create a new policy that allows any authenticated user to delete products
CREATE POLICY "Authenticated users can delete products"
  ON produits FOR DELETE
  TO authenticated
  USING (true);