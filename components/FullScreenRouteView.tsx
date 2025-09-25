import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import LoadingSpinner from './LoadingSpinner';
import CourierRouteMap from './CourierRouteMap';

interface FullScreenRouteViewProps {
  order: Order;
  onFinishDelivery: (orderId: string) => void;
  onClose: () => void;
  onUpdateOrderLocation: (orderId: string, location: { lat: number; lng: number }) => void;
}

const GEOLOCATION_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
};

const FullScreenRouteView: React.FC<FullScreenRouteViewProps> = ({ order, onFinishDelivery, onClose, onUpdateOrderLocation }) => {
  const [courierLocation, setCourierLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    let watchId: number | undefined;
    setLocationError(null);

    // 1. Get a fast initial position.
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const initialLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCourierLocation(initialLocation); // Set initial location to show map ASAP
        
        // 2. After getting the initial position, start watching for changes.
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
            setCourierLocation(newLocation);
            if(locationError) setLocationError(null); // Clear previous errors if we get a new signal
          },
          (error) => {
            console.error("Error watching location:", error);
            setLocationError("Se perdió la señal de ubicación. Intentando reconectar...");
          },
          GEOLOCATION_OPTIONS
        );
      },
      (error) => {
        console.error("Error getting initial location:", error);
        setLocationError("No se pudo obtener tu ubicación inicial. Revisa los permisos y la señal. La página puede necesitar ser recargada.");
      },
      GEOLOCATION_OPTIONS
    );

    // Cleanup function to clear the watcher when the component unmounts.
    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [order.id]);

  // Simplified effect to update the parent component.
  useEffect(() => {
    if (courierLocation) {
      onUpdateOrderLocation(order.id, courierLocation);
    }
  }, [courierLocation, order.id, onUpdateOrderLocation]);

  return (
    <div className="fixed inset-0 bg-gray-900 z-[100] flex flex-col" role="dialog" aria-modal="true" aria-labelledby="map-title">
      <header className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent z-10 flex justify-between items-center">
        <h2 id="map-title" className="text-xl font-bold text-white shadow-lg">Ruta: {order.customerName}</h2>
        <button 
          onClick={onClose} 
          className="bg-black/50 text-white rounded-full p-2 hover:bg-black/80 transition-colors"
          aria-label="Cerrar mapa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </header>
      
      <main className="flex-grow relative">
        {!courierLocation && !locationError && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-900">
            <LoadingSpinner />
            <span className="mt-4 text-gray-400">Obteniendo ubicación para la ruta...</span>
          </div>
        )}
        {locationError && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-900 p-4">
            <p className="text-red-400 text-center font-semibold text-lg">Error de Ubicación</p>
            <p className="text-red-400 text-center mt-2">{locationError}</p>
          </div>
        )}
        {courierLocation && order.destination && (
          <CourierRouteMap origin={courierLocation} destination={order.destination} />
        )}
      </main>

      <footer className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent z-10 flex flex-col items-center">
        <div className="flex items-center space-x-2 text-indigo-200 bg-black/50 py-2 px-4 rounded-full mb-4">
            <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-400"></span>
            </span>
            <span className="text-sm font-medium">Compartiendo ubicación en vivo...</span>
        </div>
        <button
            onClick={() => onFinishDelivery(order.id)}
            disabled={!courierLocation}
            className="w-full max-w-sm bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-lg transition-transform transform hover:scale-105 shadow-2xl disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
            Confirmar Entrega
        </button>
      </footer>
    </div>
  );
};

export default FullScreenRouteView;