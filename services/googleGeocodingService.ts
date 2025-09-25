// A service to handle reverse geocoding using the Google Maps API.

interface Coordinates {
    lat: number;
    lng: number;
}

// mapsApi is of type 'any' because we don't have the Google Maps JS API types installed.
export const getMunicipalityFromCoords = async (coords: Coordinates, mapsApi: any): Promise<string | null> => {
    if (!mapsApi || !mapsApi.Geocoder) {
        console.error("Google Maps Geocoder API not available.");
        return null;
    }
    
    const geocoder = new mapsApi.Geocoder();
    
    try {
        const response = await geocoder.geocode({ location: coords });
        
        if (response.results && response.results.length > 0) {
            // Find the most specific result that contains municipality info.
            for (const result of response.results) {
                 // In Cuba, 'administrative_area_level_2' often corresponds to the municipality.
                const municipalityComponent = result.address_components.find(
                    (component: any) => component.types.includes('administrative_area_level_2')
                );
                if (municipalityComponent) {
                    return municipalityComponent.long_name;
                }
                
                // As a fallback, 'locality' can also represent the municipality.
                const localityComponent = result.address_components.find(
                    (component: any) => component.types.includes('locality')
                );
                if (localityComponent) {
                    return localityComponent.long_name;
                }
            }
        }
        
        console.warn("No municipality found for the given coordinates.", coords);
        return null;

    } catch (error) {
        console.error("Reverse geocoding failed:", error);
        return null;
    }
};
