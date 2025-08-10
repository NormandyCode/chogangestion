/*
  # Système d'envoi de SMS

  1. Nouvelles tables
    - sms_messages (historique des SMS envoyés)
    - sms_templates (modèles de messages)
    
  2. Sécurité
    - RLS activé pour l'admin uniquement
*/

-- Table pour l'historique des SMS
CREATE TABLE IF NOT EXISTS sms_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number text NOT NULL,
  message text NOT NULL,
  status text CHECK(status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  sent_at timestamptz,
  error_message text,
  sent_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Table pour les modèles de messages
CREATE TABLE IF NOT EXISTS sms_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Activer RLS
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;

-- Politiques pour sms_messages (admin seulement)
CREATE POLICY "Admin can manage SMS messages"
  ON sms_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'lbmickael@icloud.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'lbmickael@icloud.com'
    )
  );

-- Politiques pour sms_templates (admin seulement)
CREATE POLICY "Admin can manage SMS templates"
  ON sms_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'lbmickael@icloud.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'lbmickael@icloud.com'
    )
  );

-- Insérer quelques modèles par défaut
INSERT INTO sms_templates (name, content, category, created_by) VALUES
('Confirmation commande', 'Bonjour {nom}, votre commande n°{numero} a été confirmée. Total: {montant}€. Merci !', 'commandes', (SELECT id FROM auth.users WHERE email = 'lbmickael@icloud.com' LIMIT 1)),
('Livraison prête', 'Bonjour {nom}, votre commande n°{numero} est prête pour la livraison. Nous vous contacterons bientôt.', 'livraison', (SELECT id FROM auth.users WHERE email = 'lbmickael@icloud.com' LIMIT 1)),
('Rappel paiement', 'Bonjour {nom}, nous vous rappelons que votre commande n°{numero} de {montant}€ est en attente de paiement.', 'paiement', (SELECT id FROM auth.users WHERE email = 'lbmickael@icloud.com' LIMIT 1))
ON CONFLICT DO NOTHING;