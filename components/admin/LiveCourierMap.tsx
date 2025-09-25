// Fix: Removed reference to google.maps types as they are not available.
import React, { useEffect, useRef } from 'react';
import { Order } from '../../types';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import LoadingSpinner from '../LoadingSpinner';

interface LiveCourierMapProps {
  allOrders: Order[];
}

// Fix: Used 'any' for map styles type as google.maps types are unavailable.
const mapStyles: any = [
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

const LiveCourierMap: React.FC<LiveCourierMapProps> = ({ allOrders }) => {
    const { isLoaded, mapsApi } = useGoogleMaps();
    const mapRef = useRef<HTMLDivElement>(null);
    // Fix: Used 'any' for map instance and markers refs.
    const mapInstance = useRef<any | null>(null);
    const markersRef = useRef<Record<string, any>>({});

    const courierList = Object.values(allOrders
        .filter(o => o.status === 'En Camino' && o.location && o.courierName)
        .reduce<Record<string, { courierName: string; location: { lat: number; lng: number }; orderDate: Date }>>((acc, order) => {
            const existing = acc[order.courierName!];
            if (!existing || order.orderDate > existing.orderDate) {
                acc[order.courierName!] = { courierName: order.courierName!, location: order.location!, orderDate: new Date(order.orderDate) };
            }
            return acc;
        }, {}));

    useEffect(() => {
        if (!isLoaded || !mapsApi || !mapRef.current || mapInstance.current) return;
        
        mapInstance.current = new mapsApi.Map(mapRef.current, {
            center: { lat: 23.113592, lng: -82.366592 }, 
            zoom: 12,
            disableDefaultUI: true,
            styles: mapStyles,
        });
    }, [isLoaded, mapsApi]);

    useEffect(() => {
        if (!mapInstance.current || !mapsApi) return;
        
        const currentMarkers = markersRef.current;
        const newCourierIds = new Set(courierList.map(c => c.courierName));
        const bounds = new mapsApi.LatLngBounds();

        Object.keys(currentMarkers).forEach(courierName => {
            if (!newCourierIds.has(courierName)) {
                currentMarkers[courierName].setMap(null);
                delete currentMarkers[courierName];
            }
        });

        courierList.forEach(courier => {
            const newPosition = new mapsApi.LatLng(courier.location.lat, courier.location.lng);
            if (currentMarkers[courier.courierName]) {
                currentMarkers[courier.courierName].setPosition(newPosition);
            } else {
                currentMarkers[courier.courierName] = new mapsApi.Marker({
                    position: newPosition,
                    map: mapInstance.current,
                    label: {
                        text: courier.courierName[0].toUpperCase(),
                        color: 'white',
                        fontWeight: 'bold',
                    },
                    title: courier.courierName,
                });
            }
            bounds.extend(newPosition);
        });
        
        if (courierList.length > 0 && bounds.getNorthEast() && !bounds.getNorthEast().equals(bounds.getSouthWest())) {
            mapInstance.current.fitBounds(bounds, 50); 
            if (mapInstance.current.getZoom()! > 15) {
                mapInstance.current.setZoom(15);
            }
        } else if (courierList.length === 1) {
            mapInstance.current.setCenter(bounds.getCenter());
            mapInstance.current.setZoom(15);
        }
    }, [courierList, mapsApi, isLoaded]);

    if (!isLoaded) {
        return (
             <div className="w-full h-[70vh] rounded-lg bg-gray-800 flex flex-col items-center justify-center">
                <LoadingSpinner />
                <p className="mt-2 text-sm text-gray-400">Cargando mapa...</p>
            </div>
        );
    }

    if (courierList.length === 0) {
        return (
            <div className="bg-gray-800/50 rounded-lg shadow-xl border border-gray-700 p-8 text-center h-[70vh] flex items-center justify-center">
                <p className="text-gray-400">No hay mensajeros activos en este momento.</p>
            </div>
        );
    }
    
    return (
        <div ref={mapRef} className="w-full h-[70vh] rounded-lg overflow-hidden border-2 border-blue-500/50" />
    );
};

export default React.memo(LiveCourierMap);