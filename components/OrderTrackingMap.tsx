// Fix: Removed reference to google.maps types as they are not available.
import React, { useEffect, useRef } from 'react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import LoadingSpinner from './LoadingSpinner';

interface OrderTrackingMapProps {
  orderId: string;
  location: {
    lat: number;
    lng: number;
  };
}

// Fix: Used 'any' for map styles type as google.maps types are unavailable.
const mapStyles: any['styles'] = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
    { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
    { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({ location }) => {
    const { isLoaded, mapsApi } = useGoogleMaps();
    const mapRef = useRef<HTMLDivElement>(null);
    // Fix: Used 'any' for map and marker instance refs.
    const mapInstance = useRef<any | null>(null);
    const markerInstance = useRef<any | null>(null);

    useEffect(() => {
        if (!isLoaded || !mapsApi || !mapRef.current || mapInstance.current) return;

        // Fix: Moved motorcycleIcon definition inside useEffect to have access to mapsApi
        // and avoid using the global 'google' object which is not defined at compile time.
        const motorcycleIcon = {
            url: 'https://maps.google.com/mapfiles/ms/icons/motorcycling.png',
            scaledSize: new mapsApi.Size(48, 48),
            anchor: new mapsApi.Point(24, 24),
        };

        mapInstance.current = new mapsApi.Map(mapRef.current, {
            center: location,
            zoom: 16,
            disableDefaultUI: true,
            styles: mapStyles,
        });
        
        markerInstance.current = new mapsApi.Marker({
            position: location,
            map: mapInstance.current,
            icon: motorcycleIcon,
            title: 'Ubicación del mensajero',
        });
    }, [isLoaded, mapsApi, location]);

    useEffect(() => {
        if (!markerInstance.current || !mapInstance.current || !mapsApi) return;
        
        const newPosition = new mapsApi.LatLng(location.lat, location.lng);
        markerInstance.current.setPosition(newPosition);
        mapInstance.current.panTo(newPosition);
    }, [location, mapsApi]);

    if (!isLoaded) {
        return (
            <div className="w-full h-64 rounded-lg bg-gray-700 flex flex-col items-center justify-center">
                <LoadingSpinner />
                <p className="mt-2 text-sm text-gray-400">Cargando mapa...</p>
            </div>
        );
    }

    return (
        <div ref={mapRef} className="w-full h-64 rounded-lg overflow-hidden border-2 border-gray-600" />
    );
};

export default React.memo(OrderTrackingMap);