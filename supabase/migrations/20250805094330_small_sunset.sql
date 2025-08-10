@@ .. @@
 CREATE OR REPLACE FUNCTION is_admin()
 RETURNS boolean AS $$
 BEGIN
-  -- Remplacez cette email par votre email d'administrateur
-  RETURN auth.jwt() ->> 'email' = 'admin@votredomaine.com';
+  -- Email de l'administrateur
+  RETURN auth.jwt() ->> 'email' = 'lbmickael@icloud.com';
 END;
 $$ LANGUAGE plpgsql SECURITY DEFINER;