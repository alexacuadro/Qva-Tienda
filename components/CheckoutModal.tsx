import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { getMunicipalityFromCoords } from '../services/googleGeocodingService';
import { DeliveryCost, CartItem, PaymentMethod } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOrder: (details: { customerName: string; customerPhone: string; destination: { lat: number; lng: number; }; municipality: string | null; deliveryFee: number; paymentMethod: PaymentMethod; }) => void;
  cartItems: CartItem[];
  deliveryCosts: DeliveryCost[];
}

const GEOLOCATION_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
};

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onConfirmOrder, cartItems, deliveryCosts }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCalculatingFee, setIsCalculatingFee] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [municipality, setMunicipality] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');

  const { isLoaded, mapsApi } = useGoogleMaps();

  useEffect(() => {
    if (isOpen) {
      setIsCalculatingFee(true);
      setError('');
      setDeliveryFee(null);
      setMunicipality(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isLoaded || !mapsApi) return;

    const calculateFee = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, GEOLOCATION_OPTIONS);
        });

        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        const foundMunicipality = await getMunicipalityFromCoords(coords, mapsApi);
        setMunicipality(foundMunicipality);

        if (foundMunicipality) {
          const cost = deliveryCosts.find(c => c.municipality.toLowerCase() === foundMunicipality.toLowerCase());
          setDeliveryFee(cost?.price || 0);
        } else {
          setDeliveryFee(null);
          setError('No se pudo determinar tu municipio. El envío no estará disponible para tu zona.');
        }
      } catch (err) {
        console.error("Fee calculation error:", err);
        setError('No se pudo obtener tu ubicación. Activa los permisos para calcular el envío.');
        setDeliveryFee(null);
      } finally {
        setIsCalculatingFee(false);
      }
    };
    
    calculateFee();

  }, [isOpen, isLoaded, mapsApi, deliveryCosts]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + (deliveryFee || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Por favor, completa tu nombre y teléfono.');
      return;
    }
    if (deliveryFee === null) {
        setError('No se ha podido calcular el costo de envío. No se puede continuar.');
        return;
    }

    setError('');
    setIsProcessing(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, GEOLOCATION_OPTIONS);
      });
      
      const destination = { lat: position.coords.latitude, lng: position.coords.longitude };
      
      onConfirmOrder({ customerName, customerPhone, destination, municipality, deliveryFee, paymentMethod });

    } catch (err) {
      console.error("Geolocation error on submit:", err);
      setError('No se pudo obtener tu ubicación final. Asegúrate de tener los permisos activados.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-blue-200">Confirmar Pedido</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Cerrar modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-gray-300 text-sm text-center">Tu pedido se entregará en tu ubicación actual. Confirma tus datos y el costo de envío.</p>
            <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-300 mb-1">Nombre Real Completo</label>
                <input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    autoFocus
                />
            </div>
            <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
                <input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Método de Pago</label>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center">
                  <input 
                    id="cash" 
                    name="paymentMethod" 
                    type="radio"
                    value="Efectivo"
                    checked={paymentMethod === 'Efectivo'}
                    onChange={() => setPaymentMethod('Efectivo')}
                    className="h-4 w-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
                  />
                  <label htmlFor="cash" className="ml-3 block text-sm font-medium text-white">
                    Pagar al recibir (Efectivo)
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-900/50 rounded-lg space-y-2 border border-gray-700">
                <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                    <span>Envío ({municipality || 'Detectando...'}):</span>
                    {isCalculatingFee ? (
                        <LoadingSpinner />
                    ) : (
                        <span>
                            {deliveryFee !== null ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(deliveryFee) : 'No disponible'}
                        </span>
                    )}
                </div>
                <div className="border-t border-gray-600 my-2"></div>
                <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total:</span>
                    <span>
                        {isCalculatingFee ? 'Calculando...' : new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(total)}
                    </span>
                </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center bg-red-900/50 p-3 rounded-lg">{error}</p>}

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isProcessing || isCalculatingFee || deliveryFee === null}
                    className="w-full bg-green-600 text-white rounded-lg py-3 px-5 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-wait transition duration-200 font-semibold flex items-center justify-center"
                >
                    {isProcessing ? (
                        <>
                            <LoadingSpinner />
                            <span className="ml-2">Procesando...</span>
                        </>
                    ) : (
                        "Confirmar Pedido"
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;