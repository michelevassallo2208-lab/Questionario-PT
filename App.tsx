import React, { useState, useEffect } from 'react';
import QuestionnaireForm from './components/QuestionnaireForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { QuestionnaireData } from './types';
import { Dumbbell, ShieldCheck, Instagram, Globe, ExternalLink } from 'lucide-react';
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
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 relative z-10">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_30px_rgba(34,197,94,0.5)]">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Questionario Ricevuto!</h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-lg mb-8 leading-relaxed">
            Grazie per aver compilato il modulo. Analizzerò i tuoi dati e ti contatterò presto per iniziare il tuo percorso.
          </p>
          <button 
            onClick={() => { setShowSuccess(false); window.location.reload(); }}
            className="bg-brand-600 text-white font-bold py-4 px-10 rounded-full hover:bg-brand-500 transition shadow-[0_0_20px_rgba(37,99,235,0.4)]"
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
            <div className="relative bg-dark-950 overflow-hidden mb-8 md:mb-12 border-b border-white/5">
               {/* Background Image restored to higher visibility */}
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
               
               {/* Fade gradients */}
               <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent"></div>
               
               <div className="relative max-w-7xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10">
                  <div className="mb-6 md:mb-8 animate-fade-in-down">
                      <img src="logo.png" alt="Davide Carfora PT" className="h-28 md:h-40 object-contain drop-shadow-2xl" onError={(e) => {e.currentTarget.style.display = 'none';}} />
                      {/* Fallback Icon if logo fails to load */}
                      <div className="bg-brand-600 text-white p-4 rounded-full mb-6 mx-auto w-20 h-20 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)]" style={{display: 'none'}}> 
                        <Dumbbell className="w-10 h-10" />
                      </div>
                  </div>
                  
                  <h1 className="text-4xl md:text-7xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg leading-tight">
                    DAVIDE CARFORA <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">PT</span>
                  </h1>
                  <p className="text-lg md:text-2xl text-gray-300 max-w-2xl leading-relaxed">
                    Il tuo percorso verso la migliore versione di te stesso.
                    <br className="hidden md:block"/> Compila il questionario per un programma scientifico.
                  </p>
               </div>
            </div>
            
            <div className="container mx-auto px-4 pb-20 relative z-10">
              <QuestionnaireForm onSubmit={handleFormSubmit} />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      
      {/* Ambient Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-dark-950/80 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo Area */}
            <div className="flex items-center cursor-pointer space-x-3 group" onClick={() => setView('LANDING')}>
              <img src="logo.png" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" alt="Logo" onError={(e) => {e.currentTarget.style.display = 'none'}} />
              <div className="flex flex-col">
                 <span className="font-bold text-lg md:text-xl text-white tracking-wider group-hover:text-brand-400 transition-colors leading-none">DAVIDE CARFORA</span>
                 <span className="text-xs text-brand-500 font-bold tracking-[0.2em]">PERSONAL TRAINER</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <a 
                href="https://carforapt.vercel.app/" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center text-gray-300 hover:text-brand-400 text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
              >
                <Globe className="w-4 h-4 mr-2 hidden md:block" />
                <span className="hidden md:inline">Sito Ufficiale</span>
                <span className="md:hidden">Sito</span>
                <ExternalLink className="w-3 h-3 ml-1 md:ml-0 md:hidden" />
              </a>

              {view === 'LANDING' && (
                <button 
                  onClick={() => setView('LOGIN')}
                  className="bg-white/5 hover:bg-white/10 text-white text-sm font-bold border border-white/10 px-4 py-2 rounded-lg transition-all"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/5 py-12 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
             <img src="logo.png" className="h-8 mb-3 opacity-50 grayscale hover:grayscale-0 transition-all" alt="Logo" onError={(e) => {e.currentTarget.style.display = 'none'}} />
            <h3 className="text-white font-bold text-lg tracking-wider">DAVIDE CARFORA PT</h3>
            <p className="text-gray-500 text-sm mt-1">Trasforma il tuo corpo, trasforma la tua mente.</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <a 
                href="https://carforapt.vercel.app/" 
                target="_blank" 
                rel="noreferrer"
                className="text-brand-400 hover:text-brand-300 text-sm font-semibold flex items-center"
            >
                Visita il sito web <ExternalLink className="w-3 h-3 ml-2" />
            </a>
            
            <div className="flex space-x-6">
                <a href="https://www.instagram.com/davide_carfora_pt/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-brand-500 transition-colors transform hover:scale-110"><Instagram className="w-6 h-6" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}