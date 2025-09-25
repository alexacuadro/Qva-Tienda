import React, { useState } from 'react';
import { Product } from '../../types';
import EditProductModal from './EditProductModal';

interface InventoryListProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ products, onUpdateProduct, onDeleteProduct }) => {
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const handleDelete = (productId: string, productName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el producto "${productName}"? Esta acción no se puede deshacer.`)) {
      onDeleteProduct(productId);
    }
  };

  return (
    <>
      <div className="bg-gray-800/50 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-blue-200 uppercase bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3">Imagen</th>
                <th scope="col" className="px-6 py-3">Nombre</th>
                <th scope="col" className="px-6 py-3">Categoría</th>
                <th scope="col" className="px-6 py-3">Precio</th>
                <th scope="col" className="px-6 py-3">Disponibilidad</th>
                <th scope="col" className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map(product => (
                  <tr key={product.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{product.name}</td>
                    <td className="px-6 py-4 text-gray-400">{product.category}</td>
                    <td className="px-6 py-4 font-semibold">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(product.price)}</td>
                    <td className="px-6 py-4">
                      <label htmlFor={`sold-out-${product.id}`} className="flex items-center cursor-pointer">
                          <div className="relative">
                              <input 
                                  type="checkbox" 
                                  id={`sold-out-${product.id}`} 
                                  className="sr-only" 
                                  checked={!!product.isSoldOut}
                                  onChange={() => onUpdateProduct({ ...product, isSoldOut: !product.isSoldOut })}
                              />
                              <div className={`block w-14 h-8 rounded-full transition-colors ${product.isSoldOut ? 'bg-red-600' : 'bg-green-500'}`}></div>
                              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${product.isSoldOut ? 'translate-x-6' : ''}`}></div>
                          </div>
                          <span className={`ml-3 font-medium text-sm ${product.isSoldOut ? 'text-red-400' : 'text-green-400'}`}>
                              {product.isSoldOut ? 'Agotado' : 'Disponible'}
                          </span>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button onClick={() => setProductToEdit(product)} className="text-blue-400 hover:text-blue-300" title="Editar">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                        </button>
                        <button onClick={() => handleDelete(product.id, product.name)} className="text-red-400 hover:text-red-300" title="Eliminar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No hay productos en el inventario.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <EditProductModal 
        product={productToEdit}
        onClose={() => setProductToEdit(null)}
        onSave={onUpdateProduct}
      />
    </>
  );
};

export default InventoryList;