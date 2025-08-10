import { supabase } from '../db/config';
import { Order, PaymentMethod } from '../types';

export async function saveOrder(order: Order): Promise<void> {
  try {
    // Create client without user_id
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({ 
        nom_complet: order.customerName,
        adresse: order.address,
        email: order.email || null,
        telephone: order.phone || null
      })
      .select('id')
      .single();

    if (clientError) throw clientError;

    // Create order without user_id
    const { data: newOrder, error: orderError } = await supabase
      .from('commandes')
      .insert({
        client_id: client.id,
        numero_facture: order.invoiceNumber,
        montant_total: order.totalAmount,
        date_creation: order.date,
        is_paid: order.isPaid,
        payment_method: order.paymentMethod,
        status: order.status || 'ordered'
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    // Process products
    for (const product of order.products) {
      // Try to get existing product first
      const { data: existingProduct, error: productQueryError } = await supabase
        .from('produits')
        .select('id')
        .eq('reference', product.reference)
        .maybeSingle();

      if (productQueryError) throw productQueryError;

      let productId;
      if (!existingProduct) {
        const { data: newProduct, error: productInsertError } = await supabase
          .from('produits')
          .insert({ 
            nom: product.name, 
            reference: product.reference,
            parfum_brand: product.parfumBrand || null
          })
          .select('id')
          .single();

        if (productInsertError) throw productInsertError;
        productId = newProduct.id;
      } else {
        productId = existingProduct.id;
      }

      const { error: linkError } = await supabase
        .from('commande_produits')
        .insert({
          commande_id: newOrder.id,
          produit_id: productId
        });

      if (linkError) throw linkError;
    }

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    throw error;
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    console.log('🔄 === DÉBUT RECHARGEMENT COMMANDES ===');
    const { data, error } = await supabase
      .from('commandes')
      .select(`
        id,
        status,
        clients (
          nom_complet,
          adresse,
          email,
          telephone
        ),
        numero_facture,
        montant_total,
        date_creation,
        is_paid,
        payment_method,
        commande_produits (
          produits (
            id,
            nom, 
            reference, 
            parfum_brand
          )
        )
      `)
      .order('date_creation', { ascending: false });

    if (error) throw error;

    if (!data) return [];

    console.log('📊 Données brutes reçues de Supabase:', {
      totalCommandes: data.length,
      premiereProduits: data[0]?.commande_produits?.map(cp => cp.produits) || []
    });
    
    // Log spécifique pour la marque
    if (data[0]?.commande_produits?.[0]?.produits) {
      const firstProduct = data[0].commande_produits[0].produits;
      console.log('🔍 PREMIER PRODUIT BRUT:', {
        nom: firstProduct.nom,
        reference: firstProduct.reference,
        parfum_brand: firstProduct.parfum_brand,
        parfum_brand_type: typeof firstProduct.parfum_brand,
        parfum_brand_value: JSON.stringify(firstProduct.parfum_brand)
      });
    }

    const orders = data.map(order => ({
      id: order.id,
      customerName: order.clients.nom_complet,
      address: order.clients.adresse,
      email: order.clients.email || undefined,
      phone: order.clients.telephone || undefined,
      products: order.commande_produits.map(cp => ({
        name: cp.produits.nom,
        reference: cp.produits.reference,
        parfumBrand: cp.produits.parfum_brand || undefined
      })),
      invoiceNumber: order.numero_facture,
      totalAmount: Number(order.montant_total),
      date: order.date_creation,
      isPaid: order.is_paid,
      paymentMethod: order.payment_method,
      status: (order.status as any) || 'ordered'
    }));

    // Log spécifique pour la marque transformée
    if (orders[0]?.products?.[0]) {
      const firstTransformedProduct = orders[0].products[0];
      console.log('🔍 PREMIER PRODUIT TRANSFORMÉ:', {
        name: firstTransformedProduct.name,
        reference: firstTransformedProduct.reference,
        parfumBrand: firstTransformedProduct.parfumBrand,
        parfumBrand_type: typeof firstTransformedProduct.parfumBrand,
        parfumBrand_value: JSON.stringify(firstTransformedProduct.parfumBrand)
      });
    }
    
    console.log('✅ === COMMANDES TRANSFORMÉES ===', {
      totalCommandes: orders.length,
      premiereCommande: orders[0]?.id || 'aucune'
    });
    
    return orders;
  } catch (error: any) {
    console.error('Erreur lors du chargement:', error);
    throw error;
  }
}

export async function deleteOrder(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('commandes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error: any) {
    console.error('Erreur lors de la suppression:', error);
    throw error;
  }
}

export async function updateOrder(order: Order): Promise<void> {
  try {
    console.log('🔄 === DÉBUT MODIFICATION COMMANDE ===', {
      orderId: order.id,
      invoiceNumber: order.invoiceNumber,
      customerName: order.customerName,
      productsCount: order.products.length,
      products: order.products.map((p, i) => `[${i+1}] ${p.name} (${p.reference}) - ${p.parfumBrand || 'pas de marque'}`)
    });
    
    // 1. Récupérer les infos de l'ancienne commande pour garder le client_id
    console.log('🔍 Récupération de l\'ancienne commande...');
    const { data: oldOrder, error: fetchError } = await supabase
      .from('commandes')
      .select('client_id')
      .eq('id', order.id)
      .single();

    if (fetchError) {
      console.error('❌ Erreur récupération commande:', fetchError);
      throw fetchError;
    }

    console.log('✅ Ancienne commande récupérée, client_id:', oldOrder.client_id);

    // 2. Supprimer l'ancienne commande (CASCADE supprime automatiquement les relations)
    console.log('🗑️ Suppression de l\'ancienne commande...');
    const { error: deleteError } = await supabase
      .from('commandes')
      .delete()
      .eq('id', order.id);

    if (deleteError) {
      console.error('❌ Erreur suppression:', deleteError);
      throw deleteError;
    }

    console.log('✅ Ancienne commande supprimée');

    // 3. Mettre à jour les infos client
    console.log('👤 Mise à jour des infos client...');
    const { error: clientUpdateError } = await supabase
      .from('clients')
      .update({
        nom_complet: order.customerName,
        adresse: order.address,
        email: order.email || null,
        telephone: order.phone || null
      })
      .eq('id', oldOrder.client_id);

    if (clientUpdateError) {
      console.error('❌ Erreur mise à jour client:', clientUpdateError);
      throw clientUpdateError;
    }

    console.log('✅ Client mis à jour');

    // 4. Recréer la commande avec le même client_id
    console.log('📝 Création de la nouvelle commande...');
    const { data: newOrder, error: orderError } = await supabase
      .from('commandes')
      .insert({
        client_id: oldOrder.client_id,
        numero_facture: order.invoiceNumber,
        montant_total: order.totalAmount,
        date_creation: order.date,
        is_paid: order.isPaid,
        payment_method: order.paymentMethod,
        status: order.status || 'ordered'
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('❌ Erreur création commande:', orderError);
      throw orderError;
    }

    console.log('✅ Nouvelle commande créée avec ID:', newOrder.id);

    // 5. Traiter TOUS les produits
    console.log('📦 === DÉBUT TRAITEMENT DES PRODUITS ===', {
      totalProducts: order.products.length,
      products: order.products.map((p, i) => `[${i+1}] ${p.name} (${p.reference}) - ${p.parfumBrand || 'pas de marque'}`)
    });
    
    for (let i = 0; i < order.products.length; i++) {
      const product = order.products[i];
      console.log(`\n📦 [${i+1}/${order.products.length}] === DÉBUT TRAITEMENT PRODUIT ===`, {
        name: product.name,
        reference: product.reference,
        brand: product.parfumBrand,
        hasName: !!product.name,
        hasReference: !!product.reference,
        hasBrand: !!product.parfumBrand
      });
      
      // Vérification des données du produit
      if (!product.name || !product.reference) {
        console.error(`❌ [${i+1}] PRODUIT INVALIDE - données manquantes:`, {
          name: product.name,
          reference: product.reference,
          nameLength: product.name?.length || 0,
          referenceLength: product.reference?.length || 0
        });
        throw new Error(`Produit ${i+1} invalide: nom ou référence manquant`);
      }
      
      // Chercher si le produit existe déjà
      console.log(`🔍 [${i+1}] Recherche produit existant avec référence:`, product.reference);
      const { data: existingProduct, error: productQueryError } = await supabase
        .from('produits')
        .select('id, nom, parfum_brand')
        .eq('reference', product.reference)
        .maybeSingle();

      if (productQueryError) {
        console.error(`❌ [${i+1}] Erreur recherche produit:`, productQueryError, {
          reference: product.reference,
          query: 'SELECT id, nom, parfum_brand FROM produits WHERE reference = ?'
        });
        throw productQueryError;
      }

      console.log(`🔍 [${i+1}] Résultat recherche:`, {
        found: !!existingProduct,
        productData: existingProduct
      });

      let productId;
      if (!existingProduct) {
        console.log(`➕ [${i+1}] === CRÉATION NOUVEAU PRODUIT ===`, {
          nom: product.name,
          reference: product.reference,
          parfum_brand: product.parfumBrand || null,
          insertData: {
            nom: product.name,
            reference: product.reference,
            parfum_brand: product.parfumBrand || null
          }
        });
        
        const { data: newProduct, error: productInsertError } = await supabase
          .from('produits')
          .insert({ 
            nom: product.name, 
            reference: product.reference,
            parfum_brand: product.parfumBrand || null
          })
          .select('id')
          .single();

        if (productInsertError) {
          console.error(`❌ [${i+1}] ERREUR CRÉATION PRODUIT:`, productInsertError, {
            productData: {
              nom: product.name,
              reference: product.reference,
              parfum_brand: product.parfumBrand || null
            },
            errorCode: productInsertError.code,
            errorMessage: productInsertError.message
          });
          throw productInsertError;
        }
        
        productId = newProduct.id;
        console.log(`✅ [${i+1}] NOUVEAU PRODUIT CRÉÉ:`, {
          productId,
          productData: newProduct
        });
      } else {
        console.log(`🔄 [${i+1}] === MISE À JOUR PRODUIT EXISTANT ===`, {
          id: existingProduct.id,
          ancienNom: existingProduct.nom,
          ancienneBrand: existingProduct.parfum_brand,
          nouveauNom: product.name,
          nouvelleBrand: product.parfumBrand,
          updateData: {
            nom: product.name,
            parfum_brand: product.parfumBrand || null
          }
        });
        
        // Mettre à jour le produit existant avec les nouvelles données
        const { error: updateProductError } = await supabase
          .from('produits')
          .update({
            nom: product.name,
            parfum_brand: product.parfumBrand || null
          })
          .eq('id', existingProduct.id);
          
        if (updateProductError) {
          console.error(`❌ [${i+1}] ERREUR MISE À JOUR PRODUIT:`, updateProductError, {
            productId: existingProduct.id,
            updateData: {
              nom: product.name,
              parfum_brand: product.parfumBrand || null
            },
            errorCode: updateProductError.code,
            errorMessage: updateProductError.message
          });
          throw updateProductError;
        }
        
        // VÉRIFICATION : Re-lire le produit pour confirmer la mise à jour
        console.log(`🔍 [${i+1}] VÉRIFICATION POST-MISE À JOUR...`);
        const { data: verificationProduct, error: verificationError } = await supabase
          .from('produits')
          .select('id, nom, reference, parfum_brand')
          .eq('id', existingProduct.id)
          .single();
          
        if (verificationError) {
          console.error(`❌ [${i+1}] ERREUR VÉRIFICATION:`, verificationError);
        } else {
          console.log(`🔍 [${i+1}] PRODUIT APRÈS MISE À JOUR EN BASE:`, {
            id: verificationProduct.id,
            nom: verificationProduct.nom,
            reference: verificationProduct.reference,
            parfum_brand: verificationProduct.parfum_brand,
            parfum_brand_type: typeof verificationProduct.parfum_brand,
            parfum_brand_value: JSON.stringify(verificationProduct.parfum_brand),
            updateWasSuccessful: verificationProduct.parfum_brand === (product.parfumBrand || null)
          });
        }
        
        productId = existingProduct.id;
        console.log(`✅ [${i+1}] PRODUIT EXISTANT MIS À JOUR:`, {
          productId,
          oldData: { nom: existingProduct.nom, parfum_brand: existingProduct.parfum_brand },
          newData: { nom: product.name, parfum_brand: product.parfumBrand || null }
        });
      }

      console.log(`🔗 [${i+1}] === CRÉATION LIEN COMMANDE-PRODUIT ===`, { 
        commande_id: newOrder.id, 
        produit_id: productId,
        productName: product.name,
        linkData: {
          commande_id: newOrder.id,
          produit_id: productId
        }
      });
      
      const { error: linkError } = await supabase
        .from('commande_produits')
        .insert({
          commande_id: newOrder.id,
          produit_id: productId
        });

      if (linkError) {
        console.error(`❌ [${i+1}] ERREUR CRÉATION LIEN:`, linkError, {
          linkData: {
            commande_id: newOrder.id,
            produit_id: productId
          },
          errorCode: linkError.code,
          errorMessage: linkError.message,
          productName: product.name
        });
        throw linkError;
      }
      
      console.log(`✅ [${i+1}] LIEN CRÉÉ AVEC SUCCÈS`);
      console.log(`🎉 [${i+1}] === PRODUIT TERMINÉ ===\n`);
    }

    console.log('🎉 === TOUS LES PRODUITS TRAITÉS AVEC SUCCÈS ===', {
      totalProduits: order.products.length,
      nouvelleCommandeId: newOrder.id,
      ancienneCommandeId: order.id
    });
    
  } catch (error) {
    console.error('💥 === ERREUR COMPLÈTE DANS updateOrder ===', error, {
      orderData: {
        id: order.id,
        customerName: order.customerName,
        invoiceNumber: order.invoiceNumber,
        productsCount: order.products.length,
        products: order.products
      },
      errorType: error.constructor.name,
      errorMessage: error.message,
      errorStack: error.stack
    });
    throw error;
  }
}

export async function updateOrderPaymentStatus(
  id: string,
  isPaid: boolean,
  paymentMethod: PaymentMethod
): Promise<void> {
  try {
    const { error } = await supabase
      .from('commandes')
      .update({
        is_paid: isPaid,
        payment_method: paymentMethod
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour:', error);
    throw error;
  }
}

export async function updateOrderStatus(
  id: string,
  status: 'ordered' | 'preparing' | 'delivered'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('commandes')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    throw error;
  }
}