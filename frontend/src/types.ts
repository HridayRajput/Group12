export interface Product {
  productId: number;
  name: string;
  category: string | null;
  brand: string | null;
  description: string | null;
  price: number;
  stockQuantity: number;
}

export interface Customer {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
}

export interface Order {
  id: number;
  customerId: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  orderDate?: string;
}

export interface User {
  userId: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  customerId: number | null;
}

export interface UserAccount extends User {
  createdAt?: string;
}

export interface CustomerLookup {
  customerId: number;
  firstName: string;
  lastName: string;
}