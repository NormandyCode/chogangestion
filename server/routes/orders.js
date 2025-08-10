// Add this new endpoint to the existing orders.js file
// Add products to existing order
router.post('/:id/products', async (req, res) => {
  const { products } = req.body;
  const orderId = req.params.id;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const product of products) {
      // Insert or update product
      const [productResult] = await connection.execute(
        'INSERT INTO produits (nom, reference) VALUES (?, ?) ON DUPLICATE KEY UPDATE nom = VALUES(nom)',
        [product.name, product.reference]
      );
      const productId = productResult.insertId || productResult.updateId;

      // Add product to order if not already present
      await connection.execute(
        'INSERT IGNORE INTO commande_produits (commande_id, produit_id) VALUES (?, ?)',
        [orderId, productId]
      );
    }

    // Update total amount
    const [currentProducts] = await connection.execute(
      'SELECT SUM(p.prix) as total FROM commande_produits cp JOIN produits p ON cp.produit_id = p.id WHERE cp.commande_id = ?',
      [orderId]
    );
    
    await connection.execute(
      'UPDATE commandes SET montant_total = ? WHERE id = ?',
      [currentProducts[0].total || 0, orderId]
    );

    await connection.commit();
    res.status(200).json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout des produits' });
  } finally {
    connection.release();
  }
});