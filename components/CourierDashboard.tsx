import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import LoadingSpinner from './LoadingSpinner';
import FullScreenRouteView from './FullScreenRouteView';

interface CourierDashboardProps {
  userName: string;
  assignedOrders: Order[];
  onUpdateOrder: (orderId: string, updates: Partial<Pick<Order, 'status'>>) => void;
  onUpdateOrderLocation: (orderId: string, location: { lat: number; lng: number }) => void;
}

const getStatusColor = (status: OrderStatus) => {
  switch(status) {
      case 'Pendiente': return 'bg-yellow-600/30 text-yellow-300 border-yellow-500/50';
      case 'En Camino': return 'bg-blue-600/30 text-blue-300 border-blue-500/50';
      case 'Entregado': return 'bg-green-600/30 text-green-300 border-green-500/50';
      case 'Cancelado': return 'bg-red-600/30 text-red-300 border-red-500/50';
  }
}

const OrderCard: React.FC<{ 
  order: Order; 
  onStartDelivery: (order: Order) => void;
  onViewRoute: (order: Order) => void;
}> = ({ order, onStartDelivery, onViewRoute }) => {
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    setIsStarting(true);
    onStartDelivery(order);
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-mono text-xs text-gray-400">{order.id}</p>
          <h3 className="text-xl font-bold text-white">{order.customerName}</h3>
          <p className="text-blue-300">{order.customerPhone}</p>
        </div>
        <div className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}>
          {order.status}
        </div>
      </div>

      {order.municipality && (
        <div>
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-gray-300">Municipio:</span> {order.municipality}
          </p>
        </div>
      )}

      {order.paymentMethod === 'Efectivo' && order.paymentStatus === 'Pendiente de Pago' && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 text-center">
            <p className="font-bold text-yellow-300 text-lg">COBRAR EN EFECTIVO</p>
            <p className="font-semibold text-white text-xl">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(order.total)}</p>
        </div>
      )}

      <div>
        <h4 className="font-semibold text-gray-300 mb-2">Artículos:</h4>
        <ul className="space-y-1 text-sm text-gray-400 list-disc list-inside">
          {order.items.map(item => (
            <li key={item.id}>
              {item.quantity} x {item.name}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="border-t border-gray-700 pt-4 flex flex-wrap gap-2 justify-between items-center">
        <div>
          <span className="text-gray-400">Total: </span>
          <span className="font-bold text-lg text-white">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(order.total)}</span>
        </div>
        <div className="flex space-x-2">
            {order.status === 'Pendiente' && (
                 <button onClick={handleStart} disabled={isStarting} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition flex items-center disabled:bg-gray-600 disabled:cursor-wait">
                    {isStarting && <LoadingSpinner />}
                    <span className="ml-2">Iniciar Ruta</span>
                </button>
            )}
            {order.status === 'En Camino' && (
              <>
                 <div className="flex items-center space-x-2 text-indigo-300 py-2 px-4">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                    <span>En reparto...</span>
                </div>
                <button onClick={() => onViewRoute(order)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition">
                    Ver Ruta en Mapa
                </button>
              </>
            )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg flex items-center space-x-4 border border-gray-700 flex-1 min-w-[200px]">
        <div className={`p-3 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const CourierDashboard: React.FC<CourierDashboardProps> = ({ userName, assignedOrders, onUpdateOrder, onUpdateOrderLocation }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [fullScreenOrder, setFullScreenOrder] = useState<Order | null>(null);
  
  const handleStartDelivery = (order: Order) => {
    onUpdateOrder(order.id, { status: 'En Camino' });
    setFullScreenOrder(order);
  };

  const handleFinishDelivery = (orderId: string) => {
    onUpdateOrder(orderId, { status: 'Entregado' });
    setFullScreenOrder(null);
  };

  const handleCloseFullScreen = () => {
    setFullScreenOrder(null);
  };

  const pendingDeliveries = assignedOrders.filter(o => o.status === 'Pendiente' || o.status === 'En Camino');
  const completedDeliveries = assignedOrders.filter(o => o.status === 'Entregado' || o.status === 'Cancelado');
  const totalEarnings = assignedOrders
    .filter(o => o.status === 'Entregado')
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <>
      <div className="p-6 h-full overflow-y-auto">
        <h2 className="text-3xl font-bold text-green-300 mb-1">Portal de Mensajero</h2>
        <p className="text-lg text-gray-300 mb-6">
          Hola, <span className="font-semibold text-white">{userName}</span>. Aquí están tus entregas asignadas.
        </p>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">Resumen de Actividad</h3>
          <div className="flex flex-wrap gap-4">
            <StatCard 
              label="Ganancias Totales"
              value={new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(totalEarnings)}
              colorClass="bg-green-900/50 text-green-300"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            />
            <StatCard 
              label="Entregas Completadas"
              value={assignedOrders.filter(o => o.status === 'Entregado').length}
              colorClass="bg-blue-900/50 text-blue-300"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <StatCard 
              label="Entregas Pendientes"
              value={pendingDeliveries.length}
              colorClass="bg-yellow-900/50 text-yellow-300"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
          </div>
        </div>
        
        <div className="space-y-6">
          {pendingDeliveries.length > 0 ? (
            pendingDeliveries.map(order => 
              <OrderCard 
                key={order.id} 
                order={order} 
                onStartDelivery={handleStartDelivery}
                onViewRoute={(order) => setFullScreenOrder(order)}
              />
            )
          ) : (
            <div className="text-center py-16 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-lg">No tienes entregas pendientes.</p>
            </div>
          )}
        </div>

        {completedDeliveries.length > 0 && (
          <div className="mt-10">
            <div className="text-center">
              <button onClick={() => setShowHistory(!showHistory)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200">
                  {showHistory ? 'Ocultar Historial' : 'Mostrar Historial'}
              </button>
            </div>
            {showHistory && (
              <div className="mt-6 space-y-4">
                  <h3 className="text-xl font-semibold text-gray-200 mb-2">Historial de Entregas</h3>
                  {completedDeliveries.map(order => (
                    <div key={order.id} className="bg-gray-800/80 p-4 rounded-lg border border-gray-700/50 flex justify-between items-center">
                        <div>
                          <p className="font-mono text-xs text-gray-500">{order.id}</p>
                          <p className="font-semibold text-white">{order.customerName}</p>
                          <p className="text-sm text-gray-400">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <div className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border mb-2 ${getStatusColor(order.status)}`}>
                              {order.status}
                          </div>
                          <p className="font-bold text-white text-lg">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(order.total)}</p>
                        </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {fullScreenOrder && (
        <FullScreenRouteView
          order={fullScreenOrder}
          onFinishDelivery={handleFinishDelivery}
          onClose={handleCloseFullScreen}
          onUpdateOrderLocation={onUpdateOrderLocation}
        />
      )}
    </>
  );
};

export default CourierDashboard;