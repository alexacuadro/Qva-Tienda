import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Quantum Laptop',
    description: 'Un portátil de última generación con procesador cuántico para un rendimiento sin igual.',
    price: 2499.99,
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800&auto=format&fit=crop',
    category: 'General',
    isSoldOut: false,
  },
  {
    id: 'prod-002',
    name: 'Chrono Watch',
    description: 'Un reloj inteligente con un diseño elegante que monitoriza tu salud y te mantiene conectado.',
    price: 499.50,
    imageUrl: 'https://images.unsplash.com/photo-1542496658-60b96a05e756?q=80&w=800&auto=format&fit=crop',
    category: 'General',
    isSoldOut: false,
  },
  {
    id: 'prod-003',
    name: 'Echo Headphones',
    description: 'Auriculares con cancelación de ruido y sonido inmersivo para una experiencia auditiva superior.',
    price: 349.00,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
    category: 'General',
    isSoldOut: true,
  },
  {
    id: 'prod-004',
    name: 'Analgésico Forte',
    description: 'Alivio rápido y efectivo para dolores de cabeza y musculares. Contiene 20 tabletas.',
    price: 8.99,
    imageUrl: 'https://images.unsplash.com/photo-1628771065518-5d824141865a?q=80&w=800&auto=format&fit=crop',
    category: 'Farmacia',
    isSoldOut: false,
  },
  {
    id: 'prod-005',
    name: 'Complejo de Vitamina C',
    description: 'Refuerza tu sistema inmunológico con nuestras cápsulas de alta potencia. 60 unidades.',
    price: 15.50,
    imageUrl: 'https://images.unsplash.com/photo-1607620843269-04ac3a152a55?q=80&w=800&auto=format&fit=crop',
    category: 'Farmacia',
    isSoldOut: false,
  },
];