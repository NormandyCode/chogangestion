/*
  # Initial Schema Setup with Authentication

  1. New Tables
    - clients (customer information)
    - produits (product catalog)
    - commandes (orders)
    - commande_produits (order-product relationships)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Set up user-based access control
*/

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  nom_complet text NOT NULL,
  adresse text NOT NULL,
  email text,
  telephone text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create produits table
CREATE TABLE IF NOT EXISTS produits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  nom text NOT NULL,
  reference text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, reference)
);

-- Create commandes table
CREATE TABLE IF NOT EXISTS commandes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  numero_facture text NOT NULL,
  montant_total decimal(10,2) NOT NULL,
  date_creation date NOT NULL,
  is_paid boolean DEFAULT false,
  payment_method text CHECK(payment_method IN ('card', 'check', 'cash', 'transfer')),
  status text CHECK(status IN ('ordered', 'preparing', 'delivered')) DEFAULT 'ordered',
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, numero_facture)
);

-- Create commande_produits table
CREATE TABLE IF NOT EXISTS commande_produits (
  commande_id uuid REFERENCES commandes(id) ON DELETE CASCADE,
  produit_id uuid REFERENCES produits(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (commande_id, produit_id)
);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE commande_produits ENABLE ROW LEVEL SECURITY;

-- Create policies for clients
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for produits
CREATE POLICY "Users can view their own products"
  ON produits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
  ON produits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON produits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON produits FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for commandes
CREATE POLICY "Users can view their own orders"
  ON commandes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON commandes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON commandes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders"
  ON commandes FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for commande_produits
CREATE POLICY "Users can view their order products"
  ON commande_produits FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM commandes
    WHERE commandes.id = commande_id
    AND commandes.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their order products"
  ON commande_produits FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM commandes
    WHERE commandes.id = commande_id
    AND commandes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their order products"
  ON commande_produits FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM commandes
    WHERE commandes.id = commande_id
    AND commandes.user_id = auth.uid()
  ));