import React, { useState } from 'react';
import { Order, User, UserRole, OrderStatus, DeliveryCost, Product } from '../types';
import ClientList from './admin/ClientList';
import ProductForm from './admin/ProductForm';
import LiveCourierMap from './admin/LiveCourierMap';
import DeliveryCostManager from './admin/DeliveryCostManager';
import Settings from './admin/Settings';
import InventoryList from './admin/InventoryList';

interface AdminDashboardProps {
  userName: string;
  allOrders: Order[];
  allUsers: User[];
  allProducts: Product[];
  deliveryCosts: DeliveryCost[];
  onUpdateOrder: (orderId: string, updates: Partial<Pick<Order, 'status' | 'courierName' | 'paymentStatus'>>) => void;
  onAddProduct: (newProduct: Omit<Product, 'id'>) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateProduct: (product: Product) => void;
  onUpdateDeliveryCosts: (costs: DeliveryCost[]) => void;
  onUpdateLogo: (logoUrl: string) => void;
}

type AdminSection = 'Pedidos' | 'Clientes' | 'Agregar Producto' | 'Inventario' | 'Mapa' | 'Costos' | 'Configuración';

const OrderRow: React.FC<{ order: Order; couriers: User[]; onUpdateOrder: AdminDashboardProps['onUpdateOrder'] }> = ({ order, couriers, onUpdateOrder }) => {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [courierName, setCourierName] = useState(order.courierName || '');

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    setStatus(newStatus);
    onUpdateOrder(order.id, { status: newStatus });
  };

  const handleCourierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCourierName = e.target.value;
    setCourierName(newCourierName);
    onUpdateOrder(order.id, { courierName: newCourierName });
  };

  const handlePaymentStatusUpdate = () => {
    if (order.paymentStatus === 'Pendiente de Pago') {
        onUpdateOrder(order.id, { paymentStatus: 'Pagado' });
    }
  };

  const total = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(order.total);
  const deliveryFee = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(order.deliveryFee || 0);
  const orderDate = new Date(order.orderDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <tr className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
      <td className="px-4 py-3 font-mono text-xs text-gray-400">{order.id}</td>
      <td className="px-4 py-3 font-medium text-white">{order.customerName}</td>
      <td className="px-4 py-3">{order.municipality || <span className="text-gray-500">N/A</span>}</td>
      <td className="px-4 py-3">{orderDate}</td>
      <td className="px-4 py-3">{deliveryFee}</td>
      <td className="px-4 py-3 font-semibold">{total}</td>
      <td className="px-4 py-3">{order.paymentMethod || 'N/A'}</td>
      <td className="px-4 py-3">
        {order.paymentStatus === 'Pagado' ? (
          <span className="flex items-center text-sm font-semibold text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            Pagado
          </span>
        ) : (
          <button 
            onClick={handlePaymentStatusUpdate} 
            className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold py-1.5 px-3 rounded-md disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={order.status !== 'Entregado'}
            title={order.status !== 'Entregado' ? 'Solo se puede marcar como pagado un pedido entregado' : 'Marcar como Pagado'}
          >
            Marcar Pagado
          </button>
        )}
      </td>
      <td className="px-4 py-3">
        <select value={status} onChange={handleStatusChange} className="bg-gray-600 border border-gray-500 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="Pendiente">Pendiente</option>
          <option value="En Camino">En Camino</option>
          <option value="Entregado">Entregado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <select value={courierName} onChange={handleCourierChange} className="bg-gray-600 border border-gray-500 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">Sin asignar</option>
          {couriers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </td>
    </tr>
  );
};

const NavItem: React.FC<{ title: string; icon: JSX.Element; isActive: boolean; onClick: () => void }> = ({ title, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
        {icon}
        <span className="font-semibold">{title}</span>
    </button>
);

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('Pedidos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { userName, allOrders, allUsers, allProducts, onUpdateOrder, onAddProduct, onDeleteProduct, onUpdateProduct, deliveryCosts, onUpdateDeliveryCosts, onUpdateLogo } = props;

  const couriers = allUsers.filter(u => u.role === UserRole.COURIER);
  const clients = allUsers.filter(u => u.role === UserRole.CLIENT);

  const sections: { name: AdminSection, icon: JSX.Element }[] = [
      { name: 'Pedidos', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
      { name: 'Clientes', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg> },
      { name: 'Inventario', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> },
      { name: 'Agregar Producto', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
      { name: 'Mapa', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
      { name: 'Costos', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
      { name: 'Configuración', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> }
  ];

  const renderContent = () => {
    switch(activeSection) {
      case 'Pedidos':
        return (
            <div className="bg-gray-800/50 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-blue-200 uppercase bg-gray-900/50">
                    <tr>
                        <th scope="col" className="px-4 py-3">ID Pedido</th>
                        <th scope="col" className="px-4 py-3">Cliente</th>
                        <th scope="col" className="px-4 py-3">Municipio</th>
                        <th scope="col" className="px-4 py-3">Fecha</th>
                        <th scope="col" className="px-4 py-3">Envío</th>
                        <th scope="col" className="px-4 py-3">Total</th>
                        <th scope="col" className="px-4 py-3">Método Pago</th>
                        <th scope="col" className="px-4 py-3">Estado Pago</th>
                        <th scope="col" className="px-4 py-3">Estado</th>
                        <th scope="col" className="px-4 py-3">Mensajero</th>
                    </tr>
                    </thead>
                    <tbody>
                    {allOrders.length > 0 ? (
                        allOrders.map(order => <OrderRow key={order.id} order={order} couriers={couriers} onUpdateOrder={onUpdateOrder} />)
                    ) : (
                        <tr>
                        <td colSpan={10} className="text-center py-8 text-gray-400">
                            No hay pedidos para mostrar.
                        </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </div>
        );
      case 'Clientes':
        return <ClientList clients={clients} />;
      case 'Agregar Producto':
        return <ProductForm onAddProduct={onAddProduct} />;
      case 'Inventario':
        return <InventoryList products={allProducts} onUpdateProduct={onUpdateProduct} onDeleteProduct={onDeleteProduct} />;
      case 'Mapa':
        return <LiveCourierMap allOrders={allOrders} />;
      case 'Costos':
        return <DeliveryCostManager initialCosts={deliveryCosts} onSave={onUpdateDeliveryCosts} />;
      case 'Configuración':
        return <Settings onUpdateLogo={onUpdateLogo} />;
      default:
        return null;
    }
  }

  return (
    <div className="h-full relative">
        {/* Backdrop */}
        {isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black/60 z-40" 
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
            />
        )}
        
        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-800/80 p-4 border-r border-gray-700 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <h2 className="text-xl font-bold text-blue-300 mb-6 px-2">Menú Admin</h2>
            <nav className="flex flex-col space-y-2">
                {sections.map(sec => (
                    <NavItem 
                        key={sec.name}
                        title={sec.name}
                        icon={sec.icon}
                        isActive={activeSection === sec.name}
                        onClick={() => {
                            setActiveSection(sec.name);
                            setIsSidebarOpen(false);
                        }}
                    />
                ))}
            </nav>
        </aside>

        {/* Main Content */}
        <main className="h-full p-6 overflow-y-auto">
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="absolute top-6 left-6 z-20 p-2 bg-gray-800/50 backdrop-blur-sm rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Abrir menú"
            >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <h2 className="text-3xl font-bold text-blue-300 mb-1 pl-12">
                {activeSection === 'Mapa' ? 'Mapa en Vivo de Mensajeros' : 
                 activeSection === 'Costos' ? 'Costos de Envío' : 
                 activeSection === 'Agregar Producto' ? 'Asistente de Creación de Productos' :
                 `Panel de ${activeSection}`}
            </h2>
            <p className="text-lg text-gray-300 mb-6 pl-12">
                Bienvenido, <span className="font-semibold text-white">{userName}</span>.
            </p>
            {renderContent()}
        </main>
    </div>
  );
};

export default AdminDashboard;