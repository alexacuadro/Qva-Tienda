import React from 'react';
import { CartItem } from '../types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const formattedTotal = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(total);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-blue-200">Carrito de Compras</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Cerrar modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex-grow overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Tu carrito está vacío.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cartItems.map(item => (
                <li key={item.id} className="flex items-center space-x-4 bg-gray-900/50 p-3 rounded-lg">
                  <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <p className="text-blue-300 text-sm">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(item.price)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-gray-600 hover:bg-gray-500">-</button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-gray-600 hover:bg-gray-500">+</button>
                  </div>
                  <p className="w-24 text-right font-semibold">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(item.price * item.quantity)}</p>
                  <button onClick={() => onRemoveItem(item.id)} className="text-red-400 hover:text-red-300" aria-label={`Quitar ${item.name} del carrito`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </main>
        
        {cartItems.length > 0 && (
          <footer className="p-4 border-t border-gray-700 bg-gray-800/50 rounded-b-2xl">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-300">Total:</span>
                <span className="text-2xl font-bold text-white ml-2">{formattedTotal}</span>
              </div>
              <button onClick={onCheckout} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition duration-200">
                Finalizar Compra
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default CartModal;
