import React, { useState, useEffect } from 'react';
import { QuestionnaireData, CustomQuestion, PinData, QuestionType } from '../types';
import { getSubmissions, deleteSubmission, getCustomQuestions, saveCustomQuestion, deleteCustomQuestion, getPins, addPin, deletePin } from '../utils';
import { Trash2, Search, ChevronDown, ChevronUp, Plus, List, CheckSquare, Square, FileDown, Database, Key, Loader2, RefreshCw, Eye, Image as ImageIcon } from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- RENDERING HELPERS ---

interface DataSectionProps {
    title: string;
    children?: React.ReactNode;
}

const DataSection: React.FC<DataSectionProps> = ({ title, children }) => (
  <div className="mb-6 bg-dark-900/50 p-4 rounded-lg border border-gray-800">
      <h4 className="text-brand-400 font-bold mb-3 uppercase tracking-wider text-sm border-b border-gray-700 pb-2">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {children}
      </div>
  </div>
);

interface DataRowProps {
    label: string;
    value: any;
}

const DataRow: React.FC<DataRowProps> = ({ label, value }) => {
    if (value === undefined || value === null || value === '' || value === false) return null;
    let displayValue = value;
    if (value === true) displayValue = <span className="text-green-400 font-bold">Sì</span>;
    if (value === 'No' || value === 'false') return null; // Hide 'No' answers to keep UI clean

    return (
      <div className="py-1 border-b border-gray-800/50 last:border-0 flex justify-between items-start gap-4">
          <span className="text-gray-500 text-sm shrink-0">{label}:</span>
          <span className="text-gray-200 text-sm font-medium text-right break-words">{displayValue}</span>
      </div>
    );
};

interface FullDetailsProps {
    sub: QuestionnaireData;
    customQuestions: CustomQuestion[];
    onDelete: (id: string) => void;
}

const FullSubmissionDetails: React.FC<FullDetailsProps> = ({ sub, customQuestions, onDelete }) => {
    return (
        <div className="p-6 border-t border-gray-700 bg-black/20 animate-fade-in text-left">
            
            <DataSection title="Anagrafica">
                <DataRow label="Età" value={sub.age} />
                <DataRow label="Sesso" value={sub.gender} />
                <DataRow label="Altezza" value={`${sub.height} cm`} />
                <DataRow label="Peso" value={`${sub.weight} kg`} />
                <DataRow label="Telefono" value={sub.phone} />
                <DataRow label="Professione" value={sub.profession} />
            </DataSection>

            <DataSection title="Salute & Clinica">
                <DataRow label="Problemi Cardiaci" value={sub.heartProblems} />
                <DataRow label="Pressione" value={sub.pressure} />
                <DataRow label="Patologie Cardio" value={sub.cardioDiseases} />
                <DataRow label="Diabete" value={sub.diabetes} />
                <DataRow label="Problemi Respiratori" value={sub.respiratoryProblems} />
                <DataRow label="Tiroide" value={sub.thyroidProblems} />
                <DataRow label="Farmaci" value={sub.medications} />
                <DataRow label="Allergie" value={sub.allergies} />
                <DataRow label="Chirurgia" value={sub.surgeries} />
            </DataSection>

            <DataSection title="Muscolo-Scheletrico">
                <DataRow label="Dolore Attuale" value={sub.currentPain} />
                <DataRow label="Colonna" value={sub.spineIssues} />
                <DataRow label="Spalle" value={sub.shoulderIssues} />
                <DataRow label="Ginocchia" value={sub.kneeIssues} />
                <DataRow label="Anche" value={sub.hipIssues} />
                <DataRow label="Caviglie" value={sub.ankleIssues} />
                <DataRow label="Infortuni Passati" value={sub.pastInjuries} />
                <DataRow label="Movimenti Dolorosi" value={sub.painfulMovements} />
            </DataSection>

            <DataSection title="Allenamento Attuale">
                <DataRow label="Si allena?" value={sub.currentlyTraining} />
                <DataRow label="Da quanto" value={sub.trainingSince} />
                <DataRow label="Frequenza" value={sub.frequency} />
                <DataRow label="Pesi" value={sub.activityType.weights} />
                <DataRow label="Cardio" value={sub.activityType.cardio} />
                <DataRow label="Sport" value={sub.activityType.sports} />
                <DataRow label="Altro" value={sub.activityType.other} />
                <DataRow label="Durata attività" value={sub.continuousActivityDuration} />
                <DataRow label="Ha avuto PT" value={sub.hashadTrainer} />
                <DataRow label="Feedback PT" value={sub.experienceFeedback} />
            </DataSection>

            <DataSection title="Stile di Vita">
                <DataRow label="Ore Sonno" value={sub.sleepHours} />
                <DataRow label="Qualità Sonno" value={sub.sleepQuality} />
                <DataRow label="Stress (1-10)" value={sub.stressLevel} />
                <DataRow label="Lavoro" value={sub.jobActivity} />
                <DataRow label="Fumo" value={sub.smoker} />
                <DataRow label="Alcol" value={sub.alcohol} />
            </DataSection>

            <DataSection title="Alimentazione">
                <DataRow label="Segue Dieta" value={sub.followsDiet} />
                <DataRow label="Intolleranze" value={sub.foodIntolerances} />
                <DataRow label="Pasti al giorno" value={sub.mealsPerDay} />
                <DataRow label="Beve Acqua" value={sub.drinksWater} />
                <DataRow label="Qualità Dieta" value={sub.dietQuality} />
            </DataSection>

            <DataSection title="Obiettivi">
                <DataRow label="Dimagrimento" value={sub.goals.weightLoss} />
                <DataRow label="Massa" value={sub.goals.muscleGain} />
                <DataRow label="Tonificazione" value={sub.goals.toning} />
                <DataRow label="Forza" value={sub.goals.strength} />
                <DataRow label="Resistenza" value={sub.goals.endurance} />
                <DataRow label="Benessere" value={sub.goals.wellness} />
                <DataRow label="Rehab" value={sub.goals.rehab} />
                <DataRow label="Performance" value={sub.goals.sportPerformance} />
                <div className="col-span-2 mt-2 bg-black/40 p-3 rounded text-gray-300 italic border-l-2 border-brand-500">
                    "{sub.mainGoalDescription}"
                </div>
            </DataSection>

            <DataSection title="Logistica & Preferenze">
                <DataRow label="Disponibilità" value={sub.weeklyAvailability} />
                <DataRow label="Minuti/Sessione" value={sub.timePerSession} />
                <DataRow label="Scadenza" value={sub.deadlineEvent} />
                <DataRow label="Impegno (1-10)" value={sub.commitmentLevel} />
                <DataRow label="Aspettative" value={sub.expectations} />
                <DataRow label="Preferenza Allenamento" value={sub.trainingPreference} />
                <DataRow label="Preferenza Trainer" value={sub.trainerStylePreference} />
            </DataSection>

            {/* Custom Questions */}
            {sub.customAnswers && Object.keys(sub.customAnswers).length > 0 && (
               <DataSection title="Domande Extra">
                  {Object.entries(sub.customAnswers).map(([k, v]) => {
                      const q = customQuestions.find(cq => cq.id === k);
                      return <DataRow key={k} label={q?.text || 'Domanda rimossa'} value={v} />
                  })}
               </DataSection>
            )}

            {/* Photos */}
            {sub.photos && sub.photos.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-brand-400 font-bold mb-4 uppercase tracking-wider text-sm flex items-center">
                        <ImageIcon className="w-4 h-4 mr-2" /> Foto Condizione
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {sub.photos.map((photo, idx) => (
                            <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-700">
                                <img 
                                  src={photo} 
                                  alt={`Cliente ${idx}`} 
                                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
                                />
                                <a 
                                  href={photo} 
                                  download={`foto_${sub.fullName.replace(/\s+/g,'_')}_${idx}.png`}
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold"
                                >
                                    <FileDown className="w-6 h-6 mr-2" /> Scarica
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end mt-8 pt-4 border-t border-gray-800">
                <button onClick={() => onDelete(sub.id)} className="flex items-center text-red-400 hover:text-red-300 bg-red-900/10 px-4 py-2 rounded hover:bg-red-900/30 transition-colors">
                    <Trash2 className="w-4 h-4 mr-2" /> Elimina Scheda Definitivamente
                </button>
            </div>
        </div>
    );
};

interface Props {
  onLogout: () => void;
}

const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [submissions, setSubmissions] = useState<QuestionnaireData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'submissions' | 'settings' | 'questions'>('submissions');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Settings & Questions State
  const [pins, setPins] = useState<PinData[]>([]);
  const [newPinLabel, setNewPinLabel] = useState('');
  const [newPinCode, setNewPinCode] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [newQText, setNewQText] = useState('');
  const [newQType, setNewQType] = useState<QuestionType>('text');
  const [newQOptions, setNewQOptions] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
        const [subs, qs, ps] = await Promise.all([
            getSubmissions(),
            getCustomQuestions(),
            getPins()
        ]);
        setSubmissions(subs);
        setCustomQuestions(qs);
        setPins(ps);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
      if (confirm("Sei sicuro di voler eliminare questa scheda? L'azione è irreversibile.")) {
          await deleteSubmission(id);
          loadData();
      }
  };

  // --- PIN & QUESTION LOGIC (Omitted for brevity, logic remains same) ---
  const handleCreatePin = async (e: React.FormEvent) => { e.preventDefault(); if (!newPinLabel || !newPinCode) return; try { await addPin(newPinCode, newPinLabel); loadData(); setNewPinLabel(''); setNewPinCode(''); setPinMsg("PIN creato!"); } catch (e) { setPinMsg("Errore"); } };
  const handleDeletePin = async (code: string) => { if (confirm("Eliminare PIN?")) { await deletePin(code); loadData(); } };
  const handleAddQuestion = async (e: React.FormEvent) => { e.preventDefault(); if(!newQText.trim()) return; const options = (['select','radio','checkbox'].includes(newQType)) ? newQOptions.split(',').map(s => s.trim()).filter(s => s !== '') : undefined; const newQ: CustomQuestion = { id: crypto.randomUUID(), text: newQText, type: newQType, options: options }; await saveCustomQuestion(newQ); setNewQText(''); setNewQOptions(''); loadData(); };
  const handleDeleteQuestion = async (id: string) => { if(confirm("Eliminare domanda?")) { await deleteCustomQuestion(id); loadData(); } };

  // --- UI Logic ---
  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);
  const toggleSelection = (id: string, e: React.MouseEvent) => { e.stopPropagation(); const newSet = new Set(selectedIds); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); setSelectedIds(newSet); };
  const toggleSelectAll = () => { if (selectedIds.size === filteredSubmissions.length) setSelectedIds(new Set()); else setSelectedIds(new Set(filteredSubmissions.map(s => s.id))); };

  // PDF Generation
  const generatePDF = () => {
      if (selectedIds.size === 0) return;
      const doc = new jsPDF();
      let isFirstPage = true;
      const subsToPrint = submissions.filter(s => selectedIds.has(s.id));
      
      subsToPrint.forEach((sub) => {
          if (!isFirstPage) doc.addPage();
          isFirstPage = false;
          doc.setFontSize(16); doc.text(`Cliente: ${sub.fullName}`, 10, 20);
          doc.setFontSize(12); doc.text(`Email: ${sub.email}`, 10, 30);
          doc.text(`Data: ${new Date(sub.submissionDate).toLocaleDateString()}`, 10, 40);
          // Simple PDF export - for full details, users should view in dashboard
          doc.text("Consultare la dashboard online per i dettagli completi e foto.", 10, 60);
      });
      doc.save(`Export_Clienti.pdf`);
  };

  const filteredSubmissions = submissions.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Database className="text-brand-500" /> Dashboard PT
                </h1>
                <p className="text-gray-400 mt-1 flex items-center gap-2">
                    {loading ? <span className="flex items-center text-brand-400"><Loader2 className="w-3 h-3 animate-spin mr-1"/> Caricamento dati...</span> : <span className="text-green-500 flex items-center">● Database Connesso</span>}
                </p>
            </div>
            <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                <button onClick={() => setActiveTab('submissions')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab==='submissions'?'bg-brand-600 text-white':'bg-dark-800 text-gray-300 hover:bg-dark-700'}`}>Clienti</button>
                <button onClick={() => setActiveTab('questions')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab==='questions'?'bg-brand-600 text-white':'bg-dark-800 text-gray-300 hover:bg-dark-700'}`}>Domande</button>
                <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab==='settings'?'bg-brand-600 text-white':'bg-dark-800 text-gray-300 hover:bg-dark-700'}`}>Settings</button>
                <button onClick={onLogout} className="px-4 py-2 bg-red-900/20 text-red-200 rounded-lg hover:bg-red-900/40">Esci</button>
            </div>
        </div>

        {activeTab === 'submissions' && (
            <>
                <div className="flex flex-col md:flex-row gap-4 mb-6 bg-dark-800 p-4 rounded-xl border border-gray-700 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Cerca cliente per nome o email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-dark-900 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-brand-500 focus:outline-none"
                        />
                    </div>
                    <button onClick={loadData} className="bg-dark-700 text-gray-300 p-3 rounded-lg hover:bg-dark-600" title="Ricarica dati"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button>
                    {selectedIds.size > 0 && (
                        <button onClick={generatePDF} className="bg-white text-black hover:bg-gray-200 px-4 py-3 rounded-lg font-bold flex items-center gap-2">
                            <FileDown className="w-5 h-5" /> PDF
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {filteredSubmissions.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                           {loading ? 'Lettura database in corso...' : 'Nessun questionario trovato.'}
                        </div>
                    ) : (
                        <>
                        <div className="flex items-center px-2 mb-2 justify-between">
                             <button onClick={toggleSelectAll} className="text-gray-400 flex items-center text-sm hover:text-white">
                                {selectedIds.size === filteredSubmissions.length ? <CheckSquare className="w-4 h-4 mr-2 text-brand-500" /> : <Square className="w-4 h-4 mr-2" />}
                                Seleziona tutti
                            </button>
                            <span className="text-sm text-gray-500">{filteredSubmissions.length} Risultati</span>
                        </div>
                        {filteredSubmissions.map((sub) => {
                            const isSelected = selectedIds.has(sub.id);
                            const isExpanded = expandedId === sub.id;
                            
                            return (
                                <div key={sub.id} className={`bg-dark-800 rounded-xl border transition-all ${isSelected ? 'border-brand-500 bg-brand-900/10' : 'border-gray-700 hover:border-brand-500/30'} overflow-hidden`}>
                                    <div className="p-4 cursor-pointer flex items-center gap-4" onClick={() => toggleExpand(sub.id)}>
                                        <div onClick={(e) => toggleSelection(sub.id, e)} className="text-gray-400 hover:text-brand-500">
                                            {isSelected ? <CheckSquare className="w-6 h-6 text-brand-500" /> : <Square className="w-6 h-6" />}
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center font-bold text-white shrink-0 border border-white/10 text-lg shadow-lg">
                                            {sub.fullName.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white text-lg">{sub.fullName}</h3>
                                                {sub.photos && sub.photos.length > 0 && <ImageIcon className="w-4 h-4 text-brand-400" />}
                                            </div>
                                            <p className="text-sm text-gray-400 flex items-center gap-2">
                                                <span>{new Date(sub.submissionDate).toLocaleDateString('it-IT')}</span>
                                                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                                <span>{sub.email}</span>
                                            </p>
                                        </div>
                                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                            <ChevronDown className="text-brand-500 w-6 h-6" />
                                        </div>
                                    </div>

                                    {/* EXPANDED DETAILS */}
                                    {isExpanded && <FullSubmissionDetails sub={sub} customQuestions={customQuestions} onDelete={handleDeleteSubmission} />}
                                </div>
                            );
                        })}
                        </>
                    )}
                </div>
            </>
        )}

        {/* TAB SETTINGS & QUESTIONS rendered same as before */}
        {activeTab === 'settings' && (
             <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 max-w-2xl mx-auto">
                 <h2 className="text-xl font-bold text-white mb-4 flex items-center"><Key className="mr-2"/> Gestione Accessi (MySQL)</h2>
                 <form onSubmit={handleCreatePin} className="flex gap-2 mb-4">
                    <input type="text" placeholder="Nome" value={newPinLabel} onChange={e=>setNewPinLabel(e.target.value)} className="bg-dark-900 text-white p-2 rounded border border-gray-600 flex-1" />
                    <input type="tel" placeholder="1234" value={newPinCode} onChange={e=>setNewPinCode(e.target.value)} className="bg-dark-900 text-white p-2 rounded border border-gray-600 w-24" />
                    <button type="submit" className="bg-brand-600 text-white p-2 rounded"><Plus /></button>
                 </form>
                 {pinMsg && <p className="text-xs text-green-400 mb-2">{pinMsg}</p>}
                 <ul className="space-y-2">
                     {pins.map((p, i) => (
                         <li key={i} className="flex justify-between bg-dark-900 p-2 rounded items-center">
                             <div><span className="text-white block font-bold">{p.label}</span><span className="text-xs text-gray-500">PIN: ****</span></div>
                             <button onClick={()=>handleDeletePin(p.code)} className="text-red-400"><Trash2 className="w-4 h-4"/></button>
                         </li>
                     ))}
                 </ul>
             </div>
        )}

        {activeTab === 'questions' && (
             <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 max-w-2xl mx-auto">
                 <h2 className="text-xl font-bold text-white mb-4 flex items-center"><List className="mr-2"/> Domande Extra</h2>
                 <form onSubmit={handleAddQuestion} className="space-y-4 mb-6">
                    <input type="text" placeholder="Domanda..." value={newQText} onChange={e=>setNewQText(e.target.value)} className="w-full bg-dark-900 text-white p-3 rounded border border-gray-600" />
                    <div className="flex gap-2">
                        <select value={newQType} onChange={e=>setNewQType(e.target.value as any)} className="bg-dark-900 text-white p-3 rounded border border-gray-600 flex-1">
                            <option value="text">Testo</option>
                            <option value="textarea">Area Testo</option>
                            <option value="radio">Scelta Singola</option>
                            <option value="checkbox">Scelta Multipla</option>
                            <option value="select">Menu a tendina</option>
                        </select>
                        <button type="submit" className="bg-brand-600 text-white px-6 rounded font-bold">Aggiungi</button>
                    </div>
                    {['radio','checkbox','select'].includes(newQType) && (
                        <input type="text" placeholder="Opzioni (separate da virgola)" value={newQOptions} onChange={e=>setNewQOptions(e.target.value)} className="w-full bg-dark-900 text-white p-3 rounded border border-gray-600" />
                    )}
                 </form>
                 <div className="space-y-2">
                     {customQuestions.map(q => (
                         <div key={q.id} className="flex justify-between items-center bg-dark-900 p-3 rounded border border-gray-600">
                             <div><span className="text-white block">{q.text}</span><span className="text-xs text-brand-400">{q.type}</span></div>
                             <button onClick={()=>handleDeleteQuestion(q.id)} className="text-red-400"><Trash2 className="w-4 h-4"/></button>
                         </div>
                     ))}
                 </div>
             </div>
        )}

        </div>
    </div>
  );
};

export default AdminDashboard;