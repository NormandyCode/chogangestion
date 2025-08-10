-- Enable PostgreSQL extensions
create extension if not exists "uuid-ossp";

-- Create auth schema and tables (if not using Supabase Auth)
create schema if not exists auth;

-- Create tables
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  nom_complet text not null,
  adresse text not null,
  email text,
  telephone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists produits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  nom text not null,
  reference text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, reference)
);

create table if not exists commandes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  client_id uuid not null references clients(id) on delete cascade,
  numero_facture text not null,
  montant_total decimal(10,2) not null,
  date_creation date not null,
  is_paid boolean default false,
  payment_method text check(payment_method in ('card', 'check', 'cash', 'transfer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, numero_facture)
);

create table if not exists commande_produits (
  commande_id uuid references commandes(id) on delete cascade,
  produit_id uuid references produits(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (commande_id, produit_id)
);

-- Enable Row Level Security
alter table clients enable row level security;
alter table produits enable row level security;
alter table commandes enable row level security;
alter table commande_produits enable row level security;

-- Create policies
create policy "Users can view their own clients"
  on clients for select
  using (auth.uid() = user_id);

create policy "Users can insert their own clients"
  on clients for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own products"
  on produits for select
  using (auth.uid() = user_id);

create policy "Users can insert their own products"
  on produits for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own orders"
  on commandes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own orders"
  on commandes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own orders"
  on commandes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own orders"
  on commandes for delete
  using (auth.uid() = user_id);

create policy "Users can view their order products"
  on commande_produits for select
  using (exists (
    select 1 from commandes
    where commandes.id = commande_id
    and commandes.user_id = auth.uid()
  ));

create policy "Users can insert their order products"
  on commande_produits for insert
  with check (exists (
    select 1 from commandes
    where commandes.id = commande_id
    and commandes.user_id = auth.uid()
  ));