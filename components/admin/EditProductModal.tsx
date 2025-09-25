import React, { useState, useEffect } from 'react';
import { Product } from '../../types';

interface EditProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'General' | 'Farmacia'>('General');
  const [isSoldOut, setIsSoldOut] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price.toString());
      setCategory(product.category);
      setIsSoldOut(product.isSoldOut || false);
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProduct: Product = {
      ...product,
      name,
      description,
      price: parseFloat(price),
      category,
      isSoldOut
    };
    onSave(updatedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-blue-200">Editar Producto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Cerrar modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label htmlFor="editProductName" className="block text-sm font-medium text-gray-300 mb-1">Nombre del Producto</label>
                <input id="editProductName" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
                <label htmlFor="editProductDescription" className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                <textarea id="editProductDescription" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="editProductPrice" className="block text-sm font-medium text-gray-300 mb-1">Precio (USD)</label>
                    <input id="editProductPrice" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                 <div>
                    <label htmlFor="editProductCategory" className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
                    <select id="editProductCategory" value={category} onChange={e => setCategory(e.target.value as 'General' | 'Farmacia')} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                        <option value="General">General</option>
                        <option value="Farmacia">Farmacia</option>
                    </select>
                </div>
            </div>
             <div className="flex items-center pt-2">
              <input 
                id="editIsSoldOut" 
                type="checkbox" 
                checked={isSoldOut}
                onChange={e => setIsSoldOut(e.target.checked)}
                className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="editIsSoldOut" className="ml-3 block text-sm font-medium text-gray-200">
                Marcar como Agotado
              </label>
            </div>
            <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="bg-gray-600 text-white rounded-lg py-2 px-5 hover:bg-gray-500 transition duration-200 font-semibold">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 px-5 hover:bg-blue-500 transition duration-200 font-semibold">Guardar Cambios</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;