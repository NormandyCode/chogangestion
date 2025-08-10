/*
  # Système d'envoi de SMS

  1. Nouvelles tables
    - sms_messages (historique des SMS envoyés)
    - sms_templates (modèles de messages)
    
  2. Sécurité
    - RLS désactivé pour simplifier l'accès
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

-- Désactiver RLS pour simplifier l'accès
ALTER TABLE sms_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates DISABLE ROW LEVEL SECURITY;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_sms_messages_created_at ON sms_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_messages_status ON sms_messages(status);
CREATE INDEX IF NOT EXISTS idx_sms_templates_category ON sms_templates(category);

-- Insérer quelques modèles par défaut
INSERT INTO sms_templates (name, content, category) VALUES
('Confirmation commande', 'Bonjour {nom}, votre commande n°{numero} a été confirmée. Total: {montant}€. Merci !', 'commandes'),
('Livraison prête', 'Bonjour {nom}, votre commande n°{numero} est prête pour la livraison. Nous vous contacterons bientôt.', 'livraison'),
('Rappel paiement', 'Bonjour {nom}, nous vous rappelons que votre commande n°{numero} de {montant}€ est en attente de paiement.', 'paiement')
ON CONFLICT DO NOTHING;