export interface Product {
  name: string;
  reference: string;
  parfumBrand?: string;
}

export type PaymentMethod = 'card' | 'check' | 'cash' | 'transfer';
export type OrderStatus = 'ordered' | 'preparing' | 'delivered';

export interface Order {
  id: string;
  customerName: string;
  address: string;
  email?: string;
  phone?: string;
  products: Product[];
  invoiceNumber: string;
  totalAmount: number;
  date: string;
  isPaid: boolean;
  paymentMethod?: PaymentMethod;
  status: OrderStatus;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
}