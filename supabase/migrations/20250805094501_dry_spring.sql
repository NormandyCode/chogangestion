/*
  # Mise à jour de l'email administrateur

  1. Modifications
    - Mettre à jour la fonction is_admin() avec le bon email administrateur
*/

-- Mettre à jour la fonction is_admin avec le bon email
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  -- Email de l'administrateur
  RETURN auth.jwt() ->> 'email' = 'lbmickael@icloud.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;