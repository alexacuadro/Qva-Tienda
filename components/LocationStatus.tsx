import React, { useState, useEffect } from 'react';

type PermissionState = 'granted' | 'prompt' | 'denied';

const LocationStatus: React.FC = () => {
  const [status, setStatus] = useState<PermissionState | null>(null);

  useEffect(() => {
    if (!navigator.permissions) {
      console.warn('Permissions API not supported.');
      return;
    }

    const checkPermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        setStatus(permissionStatus.state);
        
        const handler = () => setStatus(permissionStatus.state);
        permissionStatus.addEventListener('change', handler);
        
        return () => {
          permissionStatus.removeEventListener('change', handler);
        }
      } catch (error) {
        console.error("Error checking location permission:", error);
      }
    };

    checkPermission();
  }, []);

  const getStatusIndicator = () => {
    switch (status) {
      case 'granted':
        return {
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>,
          text: 'Ubicación Activada',
          className: 'text-green-300 border-green-700/50 bg-green-900/20',
        };
      case 'denied':
        return {
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>,
          text: 'Ubicación Desactivada',
          className: 'text-red-300 border-red-700/50 bg-red-900/20',
        };
      default:
        return {
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
          text: 'Ubicación Pendiente',
          className: 'text-gray-300 border-gray-600/50 bg-gray-800/20',
        };
    }
  };
  
  if (status === null) return null;

  const { icon, text, className } = getStatusIndicator();

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${className}`}>
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};

export default LocationStatus;
