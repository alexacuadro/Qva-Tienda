import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  onAsk: (productName: string) => void;
  onAddToCart: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onAsk, onAddToCart }) => {
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const categories = Object.keys(groupedProducts) as Array<'General' | 'Farmacia'>;
  // Ensure a consistent order
  categories.sort((a, b) => {
      if (a === 'General') return -1;
      if (b === 'General') return 1;
      return a.localeCompare(b);
  });

  return (
    <div className="mb-8 space-y-8">
      {categories.map(category => (
        <section key={category}>
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-800/50 px-4 text-2xl font-semibold text-blue-300 backdrop-blur-sm">
                {category}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedProducts[category].map((product) => (
              <ProductCard key={product.id} product={product} onAsk={onAsk} onAddToCart={onAddToCart} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ProductList;