import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PermissionsGateProps {
  onPermissionsGranted: () => void;
}

const GEOLOCATION_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
};

const PermissionsGate: React.FC<PermissionsGateProps> = ({ onPermissionsGranted }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermissions = async () => {
    setIsLoading(true);
    setError(null);

    // Solicitar permiso de geolocalización
    if (!navigator.geolocation) {
      setError('La geolocalización no es compatible con tu navegador.');
      setIsLoading(false);
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(), // Éxito
          () => reject(new Error('El permiso de ubicación es obligatorio. Por favor, actívalo en la configuración de tu navegador.')), // Error
          GEOLOCATION_OPTIONS
        );
      });
    } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
        return;
    }

    // Si el permiso se concede
    onPermissionsGranted();
  };


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-gray-800 rounded-2xl shadow-2xl text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h1 className="text-3xl font-bold tracking-wider text-blue-100">
                  Permiso de Ubicación
              </h1>
          </div>
          <p className="text-gray-300">
            Para ofrecerte una experiencia completa y personalizada, esta aplicación necesita acceso a tu <strong>ubicación</strong>.
          </p>
          <p className="text-sm text-gray-400">
            Este permiso es obligatorio para continuar. No te preocupes, tus datos están seguros con nosotros.
          </p>
          
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
                <p className="font-semibold">Acceso Denegado</p>
                <p>{error}</p>
            </div>
            )
          }

          <div className="pt-4">
              <button
                  onClick={requestPermissions}
                  disabled={isLoading}
                  className="w-full max-w-xs mx-auto bg-blue-600 text-white rounded-lg py-3 px-5 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-wait transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 font-semibold flex items-center justify-center"
              >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Procesando...</span>
                    </>
                  ) : (
                    "Aceptar y Continuar"
                  )}
              </button>
          </div>
      </div>
    </div>
  );
};

export default PermissionsGate;