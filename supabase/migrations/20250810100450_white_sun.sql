/*
  # Fix Product Update Policy

  1. Security Changes
    - Update RLS policy to allow authenticated users to update any product
    - This fixes the issue where products without user_id cannot be updated

  2. Changes Made
    - Drop the restrictive update policy for produits
    - Create a new policy that allows any authenticated user to update products
*/

-- Drop the existing restrictive update policy
DROP POLICY IF EXISTS "Users can update their own products" ON produits;

-- Create a new policy that allows any authenticated user to update products
CREATE POLICY "Authenticated users can update products"
  ON produits FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);