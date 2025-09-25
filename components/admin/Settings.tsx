import React, { useState } from 'react';
import { compressImage } from '../../utils/imageCompressor';
import LoadingSpinner from '../LoadingSpinner';

interface SettingsProps {
    onUpdateLogo: (logoUrl: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ onUpdateLogo }) => {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleFileChange = async (file: File | null) => {
        if (!file) return;

        setIsLoading(true);
        setError('');
        setLogoPreview(null);
        
        try {
            const compressedDataUrl = await compressImage(file, 2);
            setLogoPreview(compressedDataUrl);
        } catch (err: any) {
            setError('No se pudo procesar la imagen. Intente con otra.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (logoPreview) {
            onUpdateLogo(logoPreview);
            setSuccessMessage('¡Logo actualizado con éxito!');
            setLogoPreview(null);
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };
    
    return (
        <div className="bg-gray-800/50 rounded-lg shadow-xl border border-gray-700 p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Configuración General</h3>
             {successMessage && (
                <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-6 text-center">
                    {successMessage}
                </div>
            )}
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Logo de la Aplicación (máx. 2MB)</label>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-600 px-6 py-10 bg-gray-800">
                        <div className="text-center">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center">
                                    <LoadingSpinner />
                                    <p className="text-blue-300 mt-2">Comprimiendo imagen...</p>
                                </div>
                            ) : logoPreview ? (
                                <img src={logoPreview} alt="Vista previa del logo" className="mx-auto h-24 w-24 object-contain rounded-full" />
                            ) : (
                                <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                            <div className="mt-4 flex text-sm leading-6 text-gray-400 justify-center">
                                <label htmlFor="logo-upload" className="relative cursor-pointer rounded-md font-semibold text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 hover:text-blue-300">
                                    <span>{logoPreview ? 'Cambiar imagen' : 'Sube una imagen'}</span>
                                    <input id="logo-upload" name="logo-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={e => handleFileChange(e.target.files ? e.target.files[0] : null)} />
                                </label>
                            </div>
                            <p className="text-xs leading-5 text-gray-500">PNG, JPG, WEBP</p>
                            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 text-right">
                <button
                onClick={handleSave}
                disabled={!logoPreview || isLoading}
                className="bg-blue-600 text-white rounded-lg py-3 px-8 hover:bg-blue-500 transition duration-200 font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                Guardar Configuración
                </button>
            </div>
        </div>
    );
};

export default Settings;