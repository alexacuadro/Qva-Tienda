import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  logoUrl?: string | null;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, logoUrl }) => {
  return (
    <header className="bg-blue-900/50 backdrop-blur-sm shadow-lg p-4 flex items-center justify-between border-b border-blue-700/50">
      <div className="flex items-center space-x-3">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo QVA-Tienda" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            <path d="M12 11v9" />
            <path d="M18 11a4 4 0 1 1-8 0" />
            <path d="M6 11a4 4 0 1 0 8 0" />
          </svg>
        )}
        <h1 className="text-xl font-bold tracking-wider text-blue-100">
          QVA-Tienda
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
            <p className="text-white font-semibold">{user.name}</p>
            <p className="text-xs text-blue-200">{user.role}</p>
        </div>
        <button 
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2"
          aria-label="Cerrar sesión"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
