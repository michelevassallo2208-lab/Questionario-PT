import React, { useState } from 'react';
import { verifyPin, updatePin } from '../utils';
import { Lock, Info, KeyRound, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  onLoginSuccess: () => void;
}

type LoginStep = 'ENTER_PIN' | 'CHANGE_PIN';

const AdminLogin: React.FC<Props> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<LoginStep>('ENTER_PIN');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [tempOldPin, setTempOldPin] = useState('');

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
        const result = await verifyPin(pin);
        
        if (result.valid) {
            if (result.mustChange) {
                setTempOldPin(pin);
                setStep('CHANGE_PIN');
                setPin(''); 
            } else {
                onLoginSuccess();
            }
        } else {
            setError('PIN non valido o errore server.');
            setPin('');
        }
    } catch (e) {
        setError('Errore di connessione.');
    } finally {
        setLoading(false);
    }
  };

  const handleChangeSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (newPin.length < 4) {
          setError("Il nuovo PIN deve avere almeno 4 cifre.");
          return;
      }
      if (newPin === tempOldPin) {
          setError("Il nuovo PIN non può essere uguale a quello di default.");
          return;
      }
      if (newPin !== confirmNewPin) {
          setError("I nuovi PIN non coincidono.");
          return;
      }

      setLoading(true);
      try {
          await updatePin(tempOldPin, newPin);
          onLoginSuccess();
      } catch (err) {
          setError("Errore durante l'aggiornamento del PIN.");
      } finally {
          setLoading(false);
      }
  };

  if (step === 'CHANGE_PIN') {
      return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="bg-dark-800 p-8 rounded-xl shadow-2xl border border-brand-500/50 w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-500 animate-pulse"></div>
                <div className="text-center mb-6">
                    <KeyRound className="w-12 h-12 text-brand-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white">Cambio PIN Obbligatorio</h2>
                    <p className="text-gray-400 text-sm mt-2">
                        Per sicurezza, devi cambiare il PIN di default al primo accesso.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm p-3 rounded mb-6 text-center animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleChangeSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Nuovo PIN</label>
                        <input 
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*" 
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                            className="w-full bg-dark-900 text-white text-center text-2xl tracking-[0.5em] font-mono py-4 rounded border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            placeholder="••••"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Conferma Nuovo PIN</label>
                        <input 
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*" 
                            value={confirmNewPin}
                            onChange={(e) => setConfirmNewPin(e.target.value)}
                            className="w-full bg-dark-900 text-white text-center text-2xl tracking-[0.5em] font-mono py-4 rounded border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            placeholder="••••"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 px-4 rounded transition-all transform hover:scale-[1.02] shadow-lg shadow-brand-500/20 mt-4 flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Salva e Accedi <ArrowRight className="ml-2 w-5 h-5" /></>}
                    </button>
                </form>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-dark-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md">
        <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-dark-900 rounded-full flex items-center justify-center border border-gray-700">
                    <Lock className="w-8 h-8 text-brand-500" />
                </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Area Riservata</h2>
            <p className="text-gray-400 text-sm mt-2">Database Online MySQL</p>
        </div>

        {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm p-3 rounded mb-6 text-center animate-shake">
                {error}
            </div>
        )}

        <form onSubmit={handlePinSubmit} className="space-y-6">
            <div>
                <input 
                    type="tel" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-dark-900 text-white text-center text-3xl tracking-[0.5em] font-mono py-4 rounded-xl border-2 border-gray-700 focus:border-brand-500 focus:outline-none focus:ring-0 transition-colors placeholder-gray-700"
                    placeholder="••••••"
                    autoComplete="off"
                    autoFocus
                />
            </div>
            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 px-4 rounded-lg transition-transform transform hover:scale-[1.02] shadow-lg shadow-brand-500/20 flex justify-center items-center"
            >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sblocca"}
            </button>
        </form>

        <div className="mt-8 flex items-center justify-center text-xs text-gray-500 bg-dark-900/50 p-3 rounded border border-gray-800/50">
            <Info className="w-4 h-4 mr-2 text-brand-500" />
            <p>PIN iniziale: <span className="font-mono text-white">220817</span></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;