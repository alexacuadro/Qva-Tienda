import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, MessageRole, Product, CartItem, Order, DeliveryCost, PaymentMethod } from '../types';
import { sendMessageToAI } from '../services/geminiService';
import ChatMessage from './ChatMessage';
import LoadingSpinner from './LoadingSpinner';
import LocationStatus from './LocationStatus';
import ProductList from './ProductList';
import CartIcon from './CartIcon';
import CartModal from './CartModal';
import CheckoutModal from './CheckoutModal';
import OrderHistoryModal from './OrderHistoryModal';

interface ChatInterfaceProps {
    userName: string;
    cart: CartItem[];
    userOrders: Order[];
    products: Product[];
    deliveryCosts: DeliveryCost[];
    onAddToCart: (product: Product) => void;
    onUpdateCartQuantity: (productId: string, newQuantity: number) => void;
    onRemoveFromCart: (productId: string) => void;
    onPlaceOrder: (details: { customerName: string; customerPhone: string; destination: { lat: number, lng: number }; items: CartItem[]; municipality: string | null; deliveryFee?: number; paymentMethod: PaymentMethod; }) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    userName, 
    cart, 
    userOrders,
    products,
    deliveryCosts,
    onAddToCart, 
    onUpdateCartQuantity, 
    onRemoveFromCart, 
    onPlaceOrder
}) => {
  const [messages, setMessages] = useState<Message[]>([
      { id: 'initial-message', role: MessageRole.MODEL, content: `¡Hola, ${userName}! Soy QVA-Bot. Echa un vistazo a nuestros productos destacados a continuación. ¿En qué puedo ayudarte hoy?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleProductAsk = useCallback((productName: string) => {
    const question = `Háblame más sobre el ${productName}.`;
    setInput(question);
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: MessageRole.USER, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    const modelMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMessageId, role: MessageRole.MODEL, content: "" }]);

    try {
      const stream = await sendMessageToAI(input);
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === modelMessageId ? { ...msg, content: fullResponse } : msg
          )
        );
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado.');
      setMessages(prev => prev.filter(msg => msg.id !== modelMessageId));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  
  const handleConfirmOrder = (details: { customerName: string; customerPhone: string; destination: { lat: number; lng: number; }; municipality: string | null; deliveryFee: number; paymentMethod: PaymentMethod; }) => {
    onPlaceOrder({ ...details, items: cart });
    setIsCheckoutOpen(false);
    
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + details.deliveryFee;

    const confirmationMessage: Message = {
        id: `conf-${Date.now()}`,
        role: MessageRole.MODEL,
        content: `¡Gracias por tu compra, ${details.customerName}! Hemos recibido tu pedido.\n\n` +
                 `Resumen:\n` +
                 `Subtotal: ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(subtotal)}\n` +
                 `Envío a ${details.municipality || 'tu ubicación'}: ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(details.deliveryFee)}\n` +
                 `Total: ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(total)}\n\n` +
                 `Método de pago: ${details.paymentMethod}.\n\n` +
                 `Nos pondremos en contacto contigo en el teléfono ${details.customerPhone} para coordinar la entrega. ¡Vuelve pronto!`
    };
    setMessages(prev => [...prev, confirmationMessage]);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-full bg-gray-800/50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <ProductList products={products} onAsk={handleProductAsk} onAddToCart={onAddToCart} />
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
            <div className="flex justify-start items-center space-x-3">
               <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /><path d="M12 11v9" /><path d="M18 11a4 4 0 1 1-8 0" /><path d="M6 11a4 4 0 1 0 8 0" /></svg>
               </div>
                <div className="bg-gray-700 p-3 rounded-lg flex items-center">
                    <LoadingSpinner />
                    <span className="ml-2 text-gray-400 italic">QVA-Bot está pensando...</span>
                </div>
            </div>
        )}
        {error && <div className="text-red-400 text-center">{error}</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-24 right-4 z-50 flex flex-col space-y-3">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="bg-gray-600 text-white rounded-full p-4 shadow-lg hover:bg-gray-500 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
          aria-label="Ver historial de pedidos"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </button>
        <CartIcon itemCount={cartItemCount} onClick={() => setIsCartOpen(true)} />
      </div>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={onUpdateCartQuantity}
        onRemoveItem={onRemoveFromCart}
        onCheckout={handleCheckout}
      />
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirmOrder={handleConfirmOrder}
        cartItems={cart}
        deliveryCosts={deliveryCosts}
      />
      <OrderHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        orders={userOrders}
      />
      
      <div className="p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
        <div className="flex justify-center mb-3">
          <LocationStatus />
        </div>
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder=""
            className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-3 px-5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            disabled={isLoading}
            aria-label="Escribe tu consulta"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 flex items-center justify-center"
            aria-label="Enviar mensaje"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;