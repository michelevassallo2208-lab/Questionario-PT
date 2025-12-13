import React, { useState } from 'react';
import { login } from '../utils';
import { Lock, User } from 'lucide-react';

interface Props {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<Props> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      onLoginSuccess();
    } else {
      setError('Credenziali non valide. Riprova.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-dark-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md">
        <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
                <img src="logo.png" alt="Logo" className="h-16 w-auto object-contain" onError={(e) => {e.currentTarget.style.display = 'none'}} />
            </div>
            <h2 className="text-2xl font-bold text-white">Accesso Trainer</h2>
            <p className="text-gray-400 text-sm mt-2">Inserisci le credenziali per accedere.</p>
        </div>

        {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm p-3 rounded mb-6 text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Username</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-dark-900 text-white pl-10 pr-4 py-3 rounded border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        placeholder="Es. davide"
                    />
                </div>
            </div>
            <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-dark-900 text-white pl-10 pr-4 py-3 rounded border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        placeholder="••••••••"
                    />
                </div>
            </div>
            <button 
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded transition-transform transform hover:scale-[1.02] shadow-lg shadow-brand-500/20"
            >
                Accedi
            </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;