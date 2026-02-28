/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type Size = string;

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  sizes?: Size[];
}

export interface CartItem extends Product {
  selectedSize?: Size;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Paid' | 'Shipped';
  createdAt: string;
}

export enum AppState {
  BROWSING = 'BROWSING',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  CART = 'CART',
  CHECKOUT = 'CHECKOUT',
  ORDER_SUCCESS = 'ORDER_SUCCESS',
  ADMIN = 'ADMIN'
}
