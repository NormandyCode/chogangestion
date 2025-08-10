/*
  # Initial Schema Setup without Authentication

  1. New Tables
    - clients (customer information)
    - produits (product catalog)
    - commandes (orders)
    - commande_produits (order-product relationships)

  2. Security
    - Disable RLS on all tables for public access
*/

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom_complet text NOT NULL,
  adresse text NOT NULL,
  email text,
  telephone text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create produits table
CREATE TABLE IF NOT EXISTS produits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  reference text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create commandes table
CREATE TABLE IF NOT EXISTS commandes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  numero_facture text NOT NULL,
  montant_total decimal(10,2) NOT NULL,
  date_creation date NOT NULL,
  is_paid boolean DEFAULT false,
  payment_method text CHECK(payment_method IN ('card', 'check', 'cash', 'transfer')),
  status text CHECK(status IN ('ordered', 'preparing', 'delivered')) DEFAULT 'ordered',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create commande_produits table
CREATE TABLE IF NOT EXISTS commande_produits (
  commande_id uuid REFERENCES commandes(id) ON DELETE CASCADE,
  produit_id uuid REFERENCES produits(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (commande_id, produit_id)
);

-- Disable Row Level Security for public access
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE produits DISABLE ROW LEVEL SECURITY;
ALTER TABLE commandes DISABLE ROW LEVEL SECURITY;
ALTER TABLE commande_produits DISABLE ROW LEVEL SECURITY;