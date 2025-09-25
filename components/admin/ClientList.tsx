import React from 'react';
import { User } from '../../types';

interface ClientListProps {
  clients: User[];
}

const ClientList: React.FC<ClientListProps> = ({ clients }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-blue-200 uppercase bg-gray-900/50">
            <tr>
              <th scope="col" className="px-6 py-3">Nombre del Cliente</th>
              <th scope="col" className="px-6 py-3">ID / Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {clients.length > 0 ? (
              clients.map(client => (
                <tr key={client.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-white">{client.name}</td>
                  <td className="px-6 py-4 font-mono text-gray-400">{client.id}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center py-8 text-gray-400">
                  No hay clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientList;
