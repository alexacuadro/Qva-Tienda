import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [credential, setCredential] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const input = credential.trim();
    if (!input) return;

    const lowerInput = input.toLowerCase();
    const generateId = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

    // Manejar el comando de administrador: "admin002200"
    if (lowerInput.startsWith('admin')) {
      if (input.substring(5) === '002200') {
        onLogin({ id: 'admin-user', name: 'Admin', role: UserRole.ADMIN });
      } else {
        setError('Contraseña de administrador incorrecta. El formato es "admin002200".');
      }
      return;
    }

    // Manejar el comando de mensajero: "mensajero9911 Nombre Apellido"
    if (lowerInput.startsWith('mensajero')) {
      const rest = input.substring(9); // Longitud de "mensajero"
      if (rest.startsWith('9911')) {
        const name = rest.substring(4).trim(); // Longitud de "9911"
        if (name) {
          onLogin({ id: generateId(name), name, role: UserRole.COURIER });
        } else {
          setError('Falta el nombre del mensajero. El formato es "mensajero9911 [su nombre]".');
        }
      } else {
        setError('Credenciales de mensajero incorrectas. El formato es "mensajero9911 [su nombre]".');
      }
      return;
    }

    // Si no es un comando especial, tratar como nombre de cliente
    onLogin({ id: generateId(input), name: input, role: UserRole.CLIENT, cart: [] });
  };


  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-2xl">
            <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 11a4 4_4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                        <path d="M12 11v9" />
                        <path d="M18 11a4 4 0 1 1-8 0" />
                        <path d="M6 11a4 4 0 1 0 8 0" />
                    </svg>
                    <h1 className="text-3xl font-bold tracking-wider text-blue-100">
                        Bienvenido
                    </h1>
                </div>
                <p className="text-gray-400">Ingresa tu nombre para comenzar, o usa tus credenciales de acceso.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="credential" className="sr-only">Nombre o credencial</label>
                    <input
                        id="credential"
                        type="text"
                        value={credential}
                        onChange={(e) => setCredential(e.target.value)}
                        placeholder=""
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-center"
                        autoFocus
                    />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white rounded-lg py-3 px-5 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 font-semibold"
                    disabled={!credential.trim()}
                >
                    Acceder
                </button>
            </form>
        </div>
    </div>
  );
};

export default LoginScreen;