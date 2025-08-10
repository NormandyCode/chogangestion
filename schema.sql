CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  nom_complet TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS produits (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  nom TEXT NOT NULL,
  reference TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS commandes (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  client_id INTEGER NOT NULL,
  numero_facture TEXT NOT NULL UNIQUE,
  montant_total DECIMAL(10,2) NOT NULL,
  date_creation DATE NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  payment_method ENUM('card', 'check', 'cash', 'transfer'),
  status ENUM('ordered', 'preparing', 'delivered') DEFAULT 'ordered',
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS commande_produits (
  commande_id INTEGER,
  produit_id INTEGER,
  PRIMARY KEY (commande_id, produit_id),
  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id)
);