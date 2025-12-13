import React, { useState, useEffect } from 'react';
import QuestionnaireForm from './components/QuestionnaireForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { QuestionnaireData } from './types';
import { Dumbbell, ShieldCheck, Instagram, Facebook } from 'lucide-react';
import { getSubmissions, saveSubmission, isAuthenticated, logout } from './utils';

// Simple Router State
type View = 'LANDING' | 'LOGIN' | 'DASHBOARD';

export default function App() {
  const [view, setView] = useState<View>('LANDING');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check local storage for session (basic implementation)
    if (view === 'LOGIN' && isAuthenticated()) {
      setView('DASHBOARD');
    }
  }, [view]);

  const handleFormSubmit = (data: QuestionnaireData) => {
    saveSubmission(data);
    setShowSuccess(true);
    window.scrollTo(0, 0);
  };

  const renderContent = () => {
    if (showSuccess) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-green-500/50 shadow-lg">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Questionario Ricevuto!</h2>
          <p className="text-gray-300 text-xl max-w-lg mb-8">
            Grazie per aver compilato il modulo. Analizzerò i tuoi dati e ti contatterò presto per iniziare il tuo percorso.
          </p>
          <button 
            onClick={() => { setShowSuccess(false); window.location.reload(); }}
            className="bg-brand-600 text-white font-bold py-3 px-8 rounded hover:bg-brand-500 transition shadow-lg shadow-brand-500/30"
          >
            Torna alla Home
          </button>
        </div>
      );
    }

    switch (view) {
      case 'LOGIN':
        return <AdminLogin onLoginSuccess={() => setView('DASHBOARD')} />;
      case 'DASHBOARD':
        return <AdminDashboard onLogout={() => { logout(); setView('LANDING'); }} />;
      case 'LANDING':
      default:
        return (
          <>
            {/* Hero Section */}
            <div className="relative bg-dark-950 overflow-hidden mb-12 border-b border-gray-800">
               {/* Background Image restored to higher visibility */}
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
               
               {/* Fade gradients */}
               <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent"></div>
               <div className="absolute inset-0 bg-gradient-to-b from-dark-950/60 via-transparent to-transparent"></div>
               
               <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10">
                  <div className="mb-8">
                      <img src="logo.png" alt="Davide Carfora PT" className="h-32 md:h-40 object-contain drop-shadow-2xl" onError={(e) => {e.currentTarget.style.display = 'none';}} />
                      {/* Fallback Icon if logo fails to load */}
                      <div className="bg-brand-600 text-white p-4 rounded-full mb-6 mx-auto w-20 h-20 flex items-center justify-center shadow-lg shadow-brand-500/30" style={{display: 'none'}}> 
                        <Dumbbell className="w-10 h-10" />
                      </div>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
                    DAVIDE CARFORA <span className="text-brand-500">PT</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-300 max-w-3xl">
                    Il tuo percorso verso la migliore versione di te stesso inizia qui. 
                    Compila il questionario per un programma scientifico e personalizzato.
                  </p>
               </div>
            </div>
            
            <div className="container mx-auto px-4 pb-20">
              <QuestionnaireForm onSubmit={handleFormSubmit} />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-dark-950/95 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center cursor-pointer space-x-3" onClick={() => setView('LANDING')}>
              <img src="logo.png" className="h-10 w-auto object-contain" alt="Logo" onError={(e) => {e.currentTarget.style.display = 'none'}} />
              <div className="flex items-center">
                 <span className="font-bold text-xl text-white tracking-wider hover:text-brand-400 transition-colors">DAVIDE CARFORA PT</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {view === 'LANDING' && (
                <button 
                  onClick={() => setView('LOGIN')}
                  className="text-gray-400 hover:text-brand-400 text-sm font-medium transition-colors border border-transparent hover:border-brand-500/50 px-3 py-1 rounded"
                >
                  Area Riservata
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-dark-950 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex flex-col items-center md:items-start">
             <img src="logo.png" className="h-8 mb-3 opacity-50 grayscale hover:grayscale-0 transition-all" alt="Logo" onError={(e) => {e.currentTarget.style.display = 'none'}} />
            <h3 className="text-white font-bold text-lg">DAVIDE CARFORA PT</h3>
            <p className="text-gray-500 text-sm">Trasforma il tuo corpo, trasforma la tua mente.</p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-brand-500 transition-colors"><Instagram className="w-6 h-6" /></a>
            <a href="#" className="text-gray-400 hover:text-brand-500 transition-colors"><Facebook className="w-6 h-6" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}