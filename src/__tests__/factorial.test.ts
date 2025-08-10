import { expect, test } from 'vitest';
import { Order } from '../types';

test('Order total amount should be a number', () => {
  const order: Order = {
    id: '1',
    customerName: 'Jean Dupont',
    products: [{ name: 'Produit 1', reference: 'REF001' }],
    invoiceNumber: 'FACT-001',
    totalAmount: 100.50,
    date: '2024-03-14',
    isPaid: false
  };
  
  expect(typeof order.totalAmount).toBe('number');
});

test('Order should have required properties', () => {
  const order: Order = {
    id: '1',
    customerName: 'Jean Dupont',
    products: [{ name: 'Produit 1', reference: 'REF001' }],
    invoiceNumber: 'FACT-001',
    totalAmount: 100.50,
    date: '2024-03-14',
    isPaid: false
  };
  
  expect(order).toHaveProperty('customerName');
  expect(order).toHaveProperty('products');
  expect(order).toHaveProperty('invoiceNumber');
  expect(order).toHaveProperty('totalAmount');
  expect(order).toHaveProperty('date');
  expect(order).toHaveProperty('isPaid');
});