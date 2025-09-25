// Fix: Removed reference to google.maps types as they are not available.

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    // Fix: Declared google as 'any' since type definitions are not available.
    google: any;
    __googleMapsApiLoadedCallback__?: () => void;
  }
}

// Using the provided API key directly. process.env.API_KEY is not accessible
// in the browser in this application's setup and was causing the InvalidKeyMapError.
const API_KEY = 'AIzaSyD3-ViNy6MxZuTR4F1jJTXa1Yrarqv9o9U';
// The Directions Service is part of the core Maps API and does not need to be
// loaded as a separate library. Requesting the non-existent 'directions' library
// was causing loading errors. The 'geometry' library is kept for any potential
// geometric calculations.
const MAP_API_URL = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=geometry`;
const SCRIPT_ID = 'google-maps-script';

// Fix: Used 'any' for promise type.
let loadPromise: Promise<any> | null = null;
const CALLBACK_NAME = '__googleMapsApiLoadedCallback__';

export function useGoogleMaps() {
    // Fix: Used 'any' for state type.
    const [mapsApi, setMapsApi] = useState<any | null>(
        window.google && window.google.maps ? window.google.maps : null
    );
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (mapsApi) {
            return; 
        }
        
        if (!loadPromise) {
            loadPromise = new Promise((resolve, reject) => {
                if (!API_KEY) {
                    return reject(new Error("Google Maps API Key is missing."));
                }
                const existingScript = document.getElementById(SCRIPT_ID);
                if (existingScript && window.google && window.google.maps) {
                   return resolve(window.google.maps);
                }

                window[CALLBACK_NAME] = () => {
                    if (window.google && window.google.maps) {
                        resolve(window.google.maps);
                    } else {
                        reject(new Error("La API de Google Maps se cargó pero `window.google.maps` no está disponible."));
                    }
                    delete window[CALLBACK_NAME];
                };

                const script = document.createElement('script');
                script.id = SCRIPT_ID;
                script.src = `${MAP_API_URL}&callback=${CALLBACK_NAME}`;
                script.async = true;
                script.defer = true;
                
                script.onerror = () => {
                    reject(new Error("No se pudo cargar el script de la API de Google Maps."));
                    delete window[CALLBACK_NAME];
                    loadPromise = null; 
                };

                document.head.appendChild(script);
            });
        }
        
        let isMounted = true;
        loadPromise
            .then(api => {
                if (isMounted) {
                    setMapsApi(api);
                }
            })
            .catch(err => {
                if (isMounted) {
                    console.error(err);
                    setError(err);
                }
            });
            
        return () => {
            isMounted = false;
        };

    }, [mapsApi]);

    return {
        isLoaded: mapsApi !== null,
        mapsApi,
        error,
    };
}