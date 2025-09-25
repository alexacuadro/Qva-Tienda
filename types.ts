export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export enum UserRole {
    CLIENT = 'Cliente',
    COURIER = 'Mensajero',
    ADMIN = 'Administrador'
}

export interface Message {
  role: MessageRole;
  content: string;
  id: string;
}

export interface User {
    id: string;
    name: string;
    role: UserRole;
    cart?: CartItem[]; // Only for clients
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'General' | 'Farmacia';
  isSoldOut?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'Pendiente' | 'En Camino' | 'Entregado' | 'Cancelado';
export type PaymentMethod = 'Efectivo';
export type PaymentStatus = 'Pendiente de Pago' | 'Pagado';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  destination: {
    lat: number;
    lng: number;
  };
  items: CartItem[];
  deliveryFee?: number;
  total: number;
  orderDate: Date;
  status: OrderStatus;
  courierName?: string;
  location?: {
    lat: number;
    lng: number;
  };
  municipality?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
}

export interface DeliveryCost {
  municipality: string;
  price: number;
}