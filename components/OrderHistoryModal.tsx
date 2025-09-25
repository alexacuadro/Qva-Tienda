import React from 'react';
import { Order, OrderStatus, PaymentStatus } from '../types';
import OrderTrackingMap from './OrderTrackingMap';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

const getStatusBadge = (status: OrderStatus) => {
    const baseClasses = 'px-3 py-1 text-sm font-semibold rounded-full border';
    switch(status) {
        case 'Pendiente': return `${baseClasses} bg-yellow-600/30 text-yellow-300 border-yellow-500/50`;
        case 'En Camino': return `${baseClasses} bg-blue-600/30 text-blue-300 border-blue-500/50`;
        case 'Entregado': return `${baseClasses} bg-green-600/30 text-green-300 border-green-500/50`;
        case 'Cancelado': return `${baseClasses} bg-red-600/30 text-red-300 border-red-500/50`;
        default: return `${baseClasses} bg-gray-600/30 text-gray-300 border-gray-500/50`;
    }
}

const getPaymentStatusBadge = (status?: PaymentStatus) => {
    const baseClasses = 'px-2 py-0.5 text-xs font-semibold rounded-full border';
    switch(status) {
        case 'Pagado': return `${baseClasses} bg-green-600/30 text-green-300 border-green-500/50`;
        case 'Pendiente de Pago': return `${baseClasses} bg-yellow-600/30 text-yellow-300 border-yellow-500/50`;
        default: return ``;
    }
}

const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose, orders }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-blue-200">Mis Pedidos</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Cerrar modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex-grow overflow-y-auto p-4 space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Aún no has realizado ningún pedido.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 space-y-3">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                     <p className="font-mono text-xs text-gray-400">{order.id}</p>
                     <p className="font-semibold text-white">{new Date(order.orderDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                     {order.paymentMethod && <p className="text-xs text-gray-400 mt-1">Método de pago: {order.paymentMethod}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={getStatusBadge(order.status)}>{order.status}</div>
                    {order.paymentStatus && <div className={getPaymentStatusBadge(order.paymentStatus)}>{order.paymentStatus}</div>}
                  </div>
                </div>

                {order.courierName && (
                    <div className="text-sm text-gray-400">
                        <span className="font-medium text-gray-300">Mensajero:</span> {order.courierName}
                    </div>
                )}
                
                <ul className="border-t border-b border-gray-700 py-2 space-y-1">
                    {order.items.map(item => (
                        <li key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-300">{item.name} <span className="text-gray-500">x{item.quantity}</span></span>
                            <span className="text-gray-400">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(item.price * item.quantity)}</span>
                        </li>
                    ))}
                     {typeof order.deliveryFee === 'number' && (
                        <li className="flex justify-between text-sm">
                            <span className="text-gray-300">Costo de Envío</span>
                            <span className="text-gray-400">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(order.deliveryFee)}</span>
                        </li>
                    )}
                </ul>

                {order.status === 'En Camino' && order.location && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-semibold text-gray-200">Ubicación del Mensajero:</h4>
                        <div className="flex items-center space-x-1 bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full text-xs font-bold">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span>EN VIVO</span>
                        </div>
                    </div>
                    <OrderTrackingMap orderId={order.id} location={order.location} />
                  </div>
                )}

                <div className="text-right">
                    <span className="text-gray-300 font-medium">Total: </span>
                    <span className="text-white font-bold text-lg">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(order.total)}</span>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default OrderHistoryModal;