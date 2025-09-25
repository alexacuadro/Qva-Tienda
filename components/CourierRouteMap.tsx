// Fix: Removed reference to google.maps types as they are not available.
import React, { useEffect, useRef } from 'react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import LoadingSpinner from './LoadingSpinner';

interface CourierRouteMapProps {
  origin: { lat: number; lng: number; };
  destination: { lat: number; lng: number; };
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

const CourierRouteMap: React.FC<CourierRouteMapProps> = ({ origin, destination }) => {
    const { isLoaded, mapsApi } = useGoogleMaps();
    const mapRef = useRef<HTMLDivElement>(null);
    // Fix: Used 'any' for map and directions service refs.
    const mapInstance = useRef<any | null>(null);
    const directionsService = useRef<any | null>(null);
    const directionsRenderer = useRef<any | null>(null);
    const originMarker = useRef<any | null>(null);
    const destMarker = useRef<any | null>(null);

    useEffect(() => {
        if (!isLoaded || !mapsApi || !mapRef.current || mapInstance.current) return;

        directionsService.current = new mapsApi.DirectionsService();
        mapInstance.current = new mapsApi.Map(mapRef.current, {
            center: origin,
            zoom: 14,
            disableDefaultUI: true,
            styles: mapStyles,
        });

        directionsRenderer.current = new mapsApi.DirectionsRenderer({
            map: mapInstance.current,
            suppressMarkers: true, 
            polylineOptions: {
                strokeColor: '#4285F4',
                strokeWeight: 5,
                strokeOpacity: 0.8,
            }
        });
    }, [isLoaded, mapsApi, origin]);

    useEffect(() => {
        if (!directionsService.current || !directionsRenderer.current || !mapsApi) return;

        // Fix: Used 'any' for request type and used 'mapsApi' for TravelMode.
        const request: any = {
            origin: new mapsApi.LatLng(origin.lat, origin.lng),
            destination: new mapsApi.LatLng(destination.lat, destination.lng),
            travelMode: mapsApi.TravelMode.DRIVING,
            region: 'CU', // Bias directions to Cuba to improve routing accuracy for the app's target region.
        };

        directionsService.current.route(request, (result: any, status: any) => {
            if (status === 'OK' && result) {
                directionsRenderer.current?.setDirections(result);
            } else {
                console.error(`La solicitud de indicaciones falló debido a ${status}`);
            }
        });
    }, [origin, destination, mapsApi]);

    useEffect(() => {
        if (!mapInstance.current || !mapsApi) return;

        const motorcycleIcon = {
            url: 'https://maps.google.com/mapfiles/ms/icons/motorcycling.png',
            scaledSize: new mapsApi.Size(48, 48),
            anchor: new mapsApi.Point(24, 24),
        };

        const originPosition = new mapsApi.LatLng(origin.lat, origin.lng);
        if (originMarker.current) {
            originMarker.current.setPosition(originPosition);
        } else {
            originMarker.current = new mapsApi.Marker({
                position: originPosition,
                map: mapInstance.current,
                icon: motorcycleIcon,
                title: 'Tu ubicación'
            });
        }

        const destPosition = new mapsApi.LatLng(destination.lat, destination.lng);
        if (!destMarker.current) {
             destMarker.current = new mapsApi.Marker({
                position: destPosition,
                map: mapInstance.current,
                title: 'Destino del cliente'
             });
        }
        
        mapInstance.current.panTo(originPosition);
    }, [origin, destination, mapsApi, isLoaded]);

    if (!isLoaded) {
        return (
            <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center">
                <LoadingSpinner />
                <p className="mt-2 text-sm text-gray-400">Cargando ruta...</p>
            </div>
        );
    }

    return <div ref={mapRef} className="w-full h-full" />;
};

export default React.memo(CourierRouteMap);