import React, { useState, useEffect } from 'react';
import { DeliveryCost } from '../../types';

interface DeliveryCostManagerProps {
  initialCosts: DeliveryCost[];
  onSave: (costs: DeliveryCost[]) => void;
}

const DeliveryCostManager: React.FC<DeliveryCostManagerProps> = ({ initialCosts, onSave }) => {
  const [costs, setCosts] = useState<DeliveryCost[]>(initialCosts);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setCosts(initialCosts);
  }, [initialCosts]);

  const handlePriceChange = (municipality: string, newPrice: string) => {
    const priceValue = parseFloat(newPrice);
    setCosts(currentCosts =>
      currentCosts.map(cost =>
        cost.municipality === municipality
          ? { ...cost, price: isNaN(priceValue) ? 0 : priceValue }
          : cost
      )
    );
  };

  const handleSave = () => {
    onSave(costs);
    setSuccessMessage('¡Costos de envío guardados con éxito!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="bg-gray-800/50 rounded-lg shadow-xl border border-gray-700 p-8 max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-white mb-6">Gestionar Costos de Envío por Municipio</h3>
        {successMessage && (
            <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-6 text-center">
                {successMessage}
            </div>
        )}
        <div className="space-y-4">
            {costs.map(({ municipality, price }) => (
            <div key={municipality} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                <label htmlFor={municipality} className="font-medium text-gray-200">{municipality}</label>
                <div className="flex items-center space-x-2">
                    <span className="text-gray-400">$</span>
                    <input
                        id={municipality}
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => handlePriceChange(municipality, e.target.value)}
                        className="w-32 bg-gray-700 border border-gray-600 rounded-lg py-1 px-3 text-white text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                    />
                </div>
            </div>
            ))}
        </div>
        <div className="mt-8 text-right">
            <button
            onClick={handleSave}
            className="bg-blue-600 text-white rounded-lg py-3 px-8 hover:bg-blue-500 transition duration-200 font-semibold"
            >
            Guardar Cambios
            </button>
        </div>
    </div>
  );
};

export default DeliveryCostManager;
