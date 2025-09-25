import React, { useState } from 'react';
import { Product } from '../../types';
import { generateProductDetailsFromImage } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { compressImage } from '../../utils/imageCompressor';

interface ProductFormProps {
    onAddProduct: (newProduct: Omit<Product, 'id'>) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onAddProduct }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState<'General' | 'Farmacia'>('General');
    const [imageDataUri, setImageDataUri] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setCategory('General');
        setImageDataUri(null);
        setImagePreview(null);
        setError('');
    };

    const handleFileChange = async (file: File | null) => {
        if (!file) return;
        
        resetForm();
        setIsLoading(true);
        setError('');

        try {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);

            const compressedDataUrl = await compressImage(file, 2);
            setImageDataUri(compressedDataUrl);
            setImagePreview(compressedDataUrl); 
            URL.revokeObjectURL(previewUrl); 

            const base64Image = compressedDataUrl.split(',')[1];
            const details = await generateProductDetailsFromImage(base64Image, 'image/jpeg'); 
            
            setName(details.name);
            setDescription(details.description);
            setCategory(details.category);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Ocurrió un error al procesar la imagen.');
            setImagePreview(null);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description || !price || !category || !imageDataUri) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        onAddProduct({
            name,
            description,
            price: parseFloat(price),
            imageUrl: imageDataUri,
            category,
            isSoldOut: false
        });
        
        setSuccessMessage(`¡Producto "${name}" agregado con éxito!`);
        resetForm();
        setTimeout(() => setSuccessMessage(''), 4000);
    };

    return (
        <div className="bg-gray-800/50 rounded-lg shadow-xl border border-gray-700 p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-2">Asistente IA para Productos</h3>
            <p className="text-gray-400 mb-6">Sube una imagen (máx 2MB) y la IA generará el nombre, la descripción y la categoría por ti.</p>
            
            {successMessage && (
                <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-6 text-center">
                    {successMessage}
                </div>
            )}
             {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-64 border-2 ${ imagePreview ? 'border-blue-500' : 'border-gray-600' } border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700/50 relative overflow-hidden`}>
                        {isLoading && !imagePreview && (
                            <div className="flex flex-col items-center justify-center">
                                <LoadingSpinner />
                                <p className="text-blue-300 mt-2">Procesando imagen...</p>
                            </div>
                        )}
                        {imagePreview ? (
                            <img src={imagePreview} alt="Vista previa del producto" className="absolute inset-0 w-full h-full object-cover"/>
                        ) : !isLoading && (
                             <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-10 h-10 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Haz clic para subir</span> o arrastra y suelta</p>
                                <p className="text-xs text-gray-500">PNG, JPG o WEBP</p>
                            </div>
                        )}
                        <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={e => handleFileChange(e.target.files ? e.target.files[0] : null)} />
                    </label>
                </div> 

                <div className={`transition-opacity duration-500 ${imageDataUri ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-gray-800/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg">
                                <LoadingSpinner />
                                <p className="text-blue-300 mt-2">Analizando con IA...</p>
                            </div>
                        )}
                         <div>
                            <label htmlFor="productName" className="block text-sm font-medium text-gray-300 mb-1">Nombre del Producto</label>
                            <input id="productName" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required disabled={!imageDataUri} />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="productDescription" className="block text-sm font-medium text-gray-300 mb-1">Descripción</p>
                            <textarea id="productDescription" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required disabled={!imageDataUri} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label htmlFor="productPrice" className="block text-sm font-medium text-gray-300 mb-1">Precio (USD)</label>
                                <input id="productPrice" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required disabled={!imageDataUri} />
                            </div>
                            <div>
                                <label htmlFor="productCategory" className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
                                <select id="productCategory" value={category} onChange={e => setCategory(e.target.value as 'General' | 'Farmacia')} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required disabled={!imageDataUri}>
                                    <option value="General">General</option>
                                    <option value="Farmacia">Farmacia</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-3 px-5 hover:bg-blue-500 transition duration-200 font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={isLoading || !imageDataUri || !name}>
                        Agregar Producto
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;