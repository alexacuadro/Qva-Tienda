import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import CourierDashboard from './components/CourierDashboard';
import PermissionsGate from './components/PermissionsGate';
import { User, UserRole, Product, CartItem, Order, OrderStatus, DeliveryCost, PaymentMethod } from './types';
import { PRODUCTS as INITIAL_PRODUCTS } from './data/products';
import { HAVANA_MUNICIPALITIES } from './data/municipalities';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // Centralized state with localStorage persistence
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('qva-users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem('qva-orders');
    return savedOrders ? JSON.parse(savedOrders).map((o: Order) => ({...o, orderDate: new Date(o.orderDate)})) : [];
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('qva-products');
    return savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS;
  });
  const [deliveryCosts, setDeliveryCosts] = useState<DeliveryCost[]>(() => {
    const savedCosts = localStorage.getItem('qva-deliveryCosts');
    return savedCosts ? JSON.parse(savedCosts) : HAVANA_MUNICIPALITIES.map(m => ({ municipality: m, price: 0 }));
  });
  const [appLogo, setAppLogo] = useState<string | null>(() => {
    return localStorage.getItem('qva-appLogo');
  });

  useEffect(() => { localStorage.setItem('qva-users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('qva-orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('qva-products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('qva-deliveryCosts', JSON.stringify(deliveryCosts)); }, [deliveryCosts]);
  useEffect(() => {
    if (appLogo) {
      localStorage.setItem('qva-appLogo', appLogo);
    } else {
      localStorage.removeItem('qva-appLogo');
    }
  }, [appLogo]);

  useEffect(() => {
    const permissionsStatus = localStorage.getItem('permissionsGranted');
    if (permissionsStatus === 'true') {
      setPermissionsGranted(true);
    }
  }, []);

  const handleLogin = useCallback((loggedInUser: User) => {
    setUsers(currentUsers => {
        if (!currentUsers.find(u => u.id === loggedInUser.id)) {
            return [...currentUsers, loggedInUser];
        }
        return currentUsers.map(u => u.id === loggedInUser.id ? {...u, ...loggedInUser} : u);
    });
    setUser(loggedInUser);
  }, []);

  const handleLogout = useCallback(() => {
    if (user) {
        setUsers(currentUsers => currentUsers.map(u => u.id === user.id ? user : u));
    }
    setUser(null);
  }, [user]);

  const handlePermissionsGranted = useCallback(() => {
    localStorage.setItem('permissionsGranted', 'true');
    setPermissionsGranted(true);
  }, []);

  const updateUserCart = (cartUpdater: (cart: CartItem[]) => CartItem[]) => {
      setUser(currentUser => {
          if (!currentUser || currentUser.role !== UserRole.CLIENT) return currentUser;
          const currentCart = currentUser.cart || [];
          const newCart = cartUpdater(currentCart);
          return { ...currentUser, cart: newCart };
      });
  };

  const handleAddToCart = useCallback((product: Product) => {
    updateUserCart(cart => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            return cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...cart, { ...product, quantity: 1 }];
    });
  }, []);

  const handleUpdateCartItemQuantity = useCallback((productId: string, newQuantity: number) => {
    updateUserCart(cart => {
        if (newQuantity <= 0) {
            return cart.filter(item => item.id !== productId);
        }
        return cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item);
    });
  }, []);
  
  const handleRemoveFromCart = useCallback((productId: string) => {
    updateUserCart(cart => cart.filter(item => item.id !== productId));
  }, []);

  const handleClearCart = useCallback(() => {
    updateUserCart(() => []);
  }, []);

  const handlePlaceOrder = useCallback((orderDetails: { customerName: string; customerPhone: string; destination: { lat: number, lng: number }; items: CartItem[]; municipality: string | null; deliveryFee?: number; paymentMethod: PaymentMethod; }) => {
    if (!user) return;
    const subtotal = orderDetails.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = orderDetails.deliveryFee || 0;
    const total = subtotal + deliveryFee;

    const newOrder: Order = {
      id: `QVA-${Date.now()}`,
      customerId: user.id,
      customerName: orderDetails.customerName,
      customerPhone: orderDetails.customerPhone,
      destination: orderDetails.destination,
      items: orderDetails.items,
      deliveryFee,
      total,
      orderDate: new Date(),
      status: 'Pendiente',
      municipality: orderDetails.municipality || undefined,
      paymentMethod: orderDetails.paymentMethod,
      paymentStatus: orderDetails.paymentMethod === 'Efectivo' ? 'Pendiente de Pago' : 'Pagado',
    };
    setOrders(currentOrders => [newOrder, ...currentOrders]);
    handleClearCart();
  }, [user, handleClearCart]);

  const handleUpdateOrder = useCallback((orderId: string, updates: Partial<Pick<Order, 'status' | 'courierName' | 'paymentStatus'>>) => {
      setOrders(currentOrders => currentOrders.map(o => o.id === orderId ? { ...o, ...updates } : o));
  }, []);

  const handleUpdateOrderLocation = useCallback((orderId: string, location: { lat: number; lng: number }) => {
    setOrders(currentOrders => currentOrders.map(o => o.id === orderId ? { ...o, location } : o));
  }, []);

  const handleAddProduct = useCallback((newProduct: Omit<Product, 'id'>) => {
      const product: Product = { ...newProduct, id: `prod-${Date.now()}`};
      setProducts(current => [product, ...current]);
  }, []);

  const handleDeleteProduct = useCallback((productId: string) => {
    setProducts(current => current.filter(p => p.id !== productId));
  }, []);

  const handleUpdateProduct = useCallback((updatedProduct: Product) => {
    setProducts(current => current.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  }, []);

  const handleUpdateDeliveryCosts = useCallback((costs: DeliveryCost[]) => {
      setDeliveryCosts(costs);
  }, []);

  const handleUpdateLogo = useCallback((logoUrl: string) => {
      setAppLogo(logoUrl);
  }, []);


  const renderUserInterface = () => {
    if (!user) return null;
    switch (user.role) {
      case UserRole.CLIENT:
        return (
            <ChatInterface 
                userName={user.name} 
                cart={user.cart || []}
                userOrders={orders.filter(o => o.customerId === user.id)}
                products={products}
                deliveryCosts={deliveryCosts}
                onAddToCart={handleAddToCart}
                onUpdateCartQuantity={handleUpdateCartItemQuantity}
                onRemoveFromCart={handleRemoveFromCart}
                onPlaceOrder={handlePlaceOrder}
            />
        );
      case UserRole.ADMIN:
        return <AdminDashboard 
                    userName={user.name} 
                    allOrders={orders}
                    allUsers={users}
                    allProducts={products}
                    deliveryCosts={deliveryCosts}
                    onUpdateOrder={handleUpdateOrder}
                    onAddProduct={handleAddProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onUpdateProduct={handleUpdateProduct}
                    onUpdateDeliveryCosts={handleUpdateDeliveryCosts}
                    onUpdateLogo={handleUpdateLogo}
                />;
      case UserRole.COURIER:
        return <CourierDashboard 
                    userName={user.name} 
                    assignedOrders={orders.filter(o => o.courierName === user.name)}
                    onUpdateOrder={handleUpdateOrder}
                    onUpdateOrderLocation={handleUpdateOrderLocation}
                />;
      default:
        return null;
    }
  };

  if (!permissionsGranted) {
    return <PermissionsGate onPermissionsGranted={handlePermissionsGranted} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans antialiased">
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <>
          <Header user={user} onLogout={handleLogout} logoUrl={appLogo} />
          <main className="flex-grow overflow-hidden">
            {renderUserInterface()}
          </main>
        </>
      )}
    </div>
  );
};

export default App;