import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAsk: (productName: string) => void;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAsk, onAddToCart }) => {
  const formattedPrice = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col border border-gray-700/50 transform hover:-translate-y-1 transition-transform duration-300 relative">
       {product.isSoldOut && (
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 bg-red-600/80 text-white text-center py-2 text-lg font-bold uppercase tracking-widest z-10">
          Agotado
        </div>
      )}
      <img
        src={product.imageUrl}
        alt={product.name}
        className={`w-full h-48 object-cover ${product.isSoldOut ? 'filter brightness-50' : ''}`}
      />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-blue-300">{product.name}</h3>
        <p className="text-2xl font-semibold text-white my-2">{formattedPrice}</p>
        <p className="text-gray-400 text-sm mb-4 flex-grow">{product.description}</p>
        <div className="mt-auto space-y-2">
            <button
                onClick={() => onAddToCart(product)}
                className="w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-500 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 font-semibold flex items-center justify-center space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={product.isSoldOut}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                <span>{product.isSoldOut ? 'No Disponible' : 'Añadir al Carrito'}</span>
            </button>
            <button
                onClick={() => onAsk(product.name)}
                className="w-full bg-gray-600/50 text-blue-200 rounded-md py-2 px-4 hover:bg-gray-600/80 transition duration-200 font-semibold"
            >
                Preguntar a QVA-Bot
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;