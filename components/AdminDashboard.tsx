import React, { useState, useEffect, useRef } from 'react';
import { QuestionnaireData, CustomQuestion, User, QuestionType } from '../types';
import { getSubmissions, clearSubmissions, getCustomQuestions, saveCustomQuestion, deleteCustomQuestion, exportDatabase, importDatabase, getUsers, saveUser, deleteUser } from '../utils';
import { LogOut, Trash2, Search, Calendar, User as UserIcon, FileText, ChevronDown, ChevronUp, Lock, Plus, List, Download, Upload, CheckSquare, Square, FileDown, Settings, Users, AlertTriangle } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Props {
  onLogout: () => void;
}

const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [submissions, setSubmissions] = useState<QuestionnaireData[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'submissions' | 'settings' | 'questions'>('submissions');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Account Management State
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [accountMsg, setAccountMsg] = useState('');

  // Custom Questions State
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [newQText, setNewQText] = useState('');
  const [newQType, setNewQType] = useState<QuestionType>('text');
  const [newQOptions, setNewQOptions] = useState(''); // Comma separated

  // Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSubmissions(getSubmissions());
    setCustomQuestions(getCustomQuestions());
    setUsers(getUsers());

    // FORCE SETUP: If no users exist, force user to Settings tab
    if (getUsers().length === 0) {
        setActiveTab('settings');
    }
  }, []);

  const handleClearAll = () => {
    if (confirm("ATTENZIONE: Stai per cancellare TUTTI i dati. Assicurati di aver fatto un BACKUP prima. Procedere?")) {
      clearSubmissions();
      setSubmissions([]);
      setSelectedIds(new Set());
    }
  };

  // --- ACCOUNT LOGIC ---
  const handleCreateUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newUsername || !newPassword) {
          setAccountMsg("Inserisci username e password.");
          return;
      }
      try {
          saveUser(newUsername, newPassword);
          setUsers(getUsers());
          setNewUsername('');
          setNewPassword('');
          setAccountMsg("Account creato con successo!");
      } catch (e) {
          setAccountMsg("Errore: Utente già esistente.");
      }
  };

  const handleDeleteUser = (username: string) => {
      if (users.length === 1) {
          alert("Non puoi eliminare l'ultimo amministratore.");
          return;
      }
      if (confirm(`Eliminare l'utente ${username}?`)) {
          deleteUser(username);
          setUsers(getUsers());
      }
  };

  // --- QUESTION LOGIC ---
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newQText.trim()) return;

    const options = (newQType === 'select' || newQType === 'radio' || newQType === 'checkbox') 
        ? newQOptions.split(',').map(s => s.trim()).filter(s => s !== '')
        : undefined;

    const newQ: CustomQuestion = {
        id: crypto.randomUUID(),
        text: newQText,
        type: newQType,
        options: options
    };

    saveCustomQuestion(newQ);
    setNewQText('');
    setNewQOptions('');
    setNewQType('text');
    setCustomQuestions(getCustomQuestions());
  };

  const handleDeleteQuestion = (id: string) => {
    if(confirm("Eliminare questa domanda? Le risposte nei vecchi questionari rimarranno salvate.")) {
        deleteCustomQuestion(id);
        setCustomQuestions(getCustomQuestions());
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Selection Logic
  const toggleSelection = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
      if (selectedIds.size === filteredSubmissions.length && filteredSubmissions.length > 0) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(filteredSubmissions.map(s => s.id)));
      }
  };

  // Restore Logic
  const handleRestoreClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const success = await importDatabase(e.target.files[0]);
          if (success) {
              alert("Backup ripristinato con successo! La pagina verrà ricaricata.");
              window.location.reload();
          } else {
              alert("Errore nel ripristino del backup. Il file potrebbe essere corrotto.");
          }
      }
  };

  // PDF Generation Logic
  const generatePDF = () => {
      if (selectedIds.size === 0) return;

      const doc = new jsPDF();
      let isFirstPage = true;

      const subsToPrint = submissions.filter(s => selectedIds.has(s.id));

      subsToPrint.forEach((sub, index) => {
          if (!isFirstPage) {
              doc.addPage();
          }
          isFirstPage = false;

          // Header
          doc.setFillColor(59, 130, 246); // Brand Blue
          doc.rect(0, 0, 210, 20, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(16);
          doc.text("SCHEDA CLIENTE - DAVIDE CARFORA PT", 10, 13);
          
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          
          let y = 30;
          const lineHeight = 7;
          
          const printLine = (label: string, value: any) => {
              if (y > 280) { doc.addPage(); y = 20; }
              doc.setFont("helvetica", "bold");
              doc.text(`${label}:`, 10, y);
              doc.setFont("helvetica", "normal");
              const valStr = value === true ? 'Sì' : value === false ? 'No' : String(value || '-');
              doc.text(valStr, 60, y);
              y += lineHeight;
          };

          const printSection = (title: string) => {
              if (y > 270) { doc.addPage(); y = 20; }
              y += 5;
              doc.setFont("helvetica", "bold");
              doc.setTextColor(59, 130, 246);
              doc.text(title.toUpperCase(), 10, y);
              doc.line(10, y+1, 200, y+1);
              doc.setTextColor(0, 0, 0);
              y += 10;
          };

          // Standard Sections (Same as before)
          printSection("Dati Anagrafici");
          printLine("Nome", sub.fullName);
          printLine("Email", sub.email);
          printLine("Telefono", sub.phone);
          
          printSection("Salute");
          printLine("Problemi Cuore", sub.heartProblems);
          printLine("Infortuni Passati", sub.pastInjuries);

          printSection("Obiettivi");
          printLine("Obiettivi", Object.entries(sub.goals).filter(([_,v]) => v).map(([k]) => k).join(', '));
          
           // Descrizione Lunga
          if (y > 250) { doc.addPage(); y = 20; }
          y += 5;
          doc.setFont("helvetica", "bold");
          doc.text("Descrizione:", 10, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          const splitGoal = doc.splitTextToSize(sub.mainGoalDescription, 190);
          doc.text(splitGoal, 10, y);
          y += (splitGoal.length * 5) + 5;

          // Custom Answers
          if (sub.customAnswers && Object.keys(sub.customAnswers).length > 0) {
              printSection("Domande Extra");
              Object.entries(sub.customAnswers).forEach(([qId, ans]) => {
                   const qText = customQuestions.find(cq => cq.id === qId)?.text || "Domanda rimossa";
                   if (y > 270) { doc.addPage(); y = 20; }
                   doc.setFont("helvetica", "bold");
                   doc.text(`D: ${qText}`, 10, y);
                   y += 5;
                   doc.setFont("helvetica", "normal");
                   const splitAns = doc.splitTextToSize(String(ans), 190);
                   doc.text(splitAns, 10, y);
                   y += (splitAns.length * 5) + 5;
              });
          }

          // Footer
          doc.setFontSize(8);
          doc.text(`Data Compilazione: ${new Date(sub.submissionDate).toLocaleDateString()}`, 10, 290);
      });

      doc.save(`Schede_Clienti_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const filteredSubmissions = submissions.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const DataRow = ({ label, value }: { label: string, value: any }) => {
      if (!value || value === 'false') return null;
      const displayValue = value === true || value === 'true' ? 'Sì' : value;
      return (
        <div className="py-2 border-b border-gray-800 last:border-0">
            <span className="text-gray-400 text-sm block">{label}</span>
            <span className="text-white font-medium">{displayValue.toString()}</span>
        </div>
      );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
        <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Clienti</h1>
            <p className="text-gray-400">Pannello di controllo amministrativo.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
            {users.length > 0 && (
                <>
                <button 
                    onClick={() => setActiveTab('submissions')}
                    className={`flex-1 xl:flex-none px-4 py-3 rounded-lg font-medium transition-colors text-center ${activeTab === 'submissions' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-gray-300 bg-dark-800 hover:bg-dark-700'}`}
                >
                    Questionari
                </button>
                <button 
                    onClick={() => setActiveTab('questions')}
                    className={`flex-1 xl:flex-none px-4 py-3 rounded-lg font-medium transition-colors text-center ${activeTab === 'questions' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-gray-300 bg-dark-800 hover:bg-dark-700'}`}
                >
                    Domande
                </button>
                </>
            )}
            <button 
                onClick={() => setActiveTab('settings')}
                className={`flex-1 xl:flex-none px-4 py-3 rounded-lg font-medium transition-colors text-center ${activeTab === 'settings' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-gray-300 bg-dark-800 hover:bg-dark-700'}`}
            >
                Settings
            </button>
            <button 
                onClick={onLogout} 
                className="flex-1 xl:flex-none flex items-center justify-center px-4 py-3 bg-red-900/20 border border-red-900/50 text-red-200 hover:bg-red-900 hover:text-white rounded-lg transition-colors"
            >
                <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
        </div>
      </div>

      {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Account Management */}
              <div className="bg-dark-800 p-8 rounded-lg shadow-xl border border-gray-700">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Users className="mr-3 text-brand-500" /> Gestione Account
                  </h2>
                  
                  {users.length === 0 && (
                      <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 p-4 rounded text-yellow-100 flex items-start">
                          <AlertTriangle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                          <p className="text-sm">
                              <strong>Attenzione:</strong> Accesso temporaneo (1/1). Crea subito un account per proteggere il database.
                          </p>
                      </div>
                  )}

                  <form onSubmit={handleCreateUser} className="mb-8 border-b border-gray-700 pb-8">
                      <h3 className="text-white font-semibold mb-4">Crea Nuovo Admin</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <input 
                            type="text" 
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="bg-dark-900 border border-gray-600 rounded p-3 text-white focus:border-brand-500 focus:outline-none"
                            placeholder="Username"
                        />
                        <input 
                            type="text" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-dark-900 border border-gray-600 rounded p-3 text-white focus:border-brand-500 focus:outline-none"
                            placeholder="Password"
                        />
                      </div>
                      <button type="submit" className="w-full bg-brand-600 text-white font-bold py-3 rounded hover:bg-brand-500 transition-colors">
                          Crea Account
                      </button>
                      {accountMsg && <p className="mt-2 text-sm text-green-400">{accountMsg}</p>}
                  </form>

                  <div>
                      <h3 className="text-white font-semibold mb-4">Account Esistenti</h3>
                      {users.length === 0 ? <p className="text-gray-500 italic">Nessun account.</p> : (
                          <ul className="space-y-2">
                              {users.map(u => (
                                  <li key={u.username} className="flex justify-between items-center bg-dark-900 p-3 rounded">
                                      <span className="text-gray-300">{u.username}</span>
                                      <button onClick={() => handleDeleteUser(u.username)} className="text-red-400 hover:text-red-200">
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </li>
                              ))}
                          </ul>
                      )}
                  </div>
              </div>

              {/* Backup & Restore */}
              <div className="bg-dark-800 p-8 rounded-lg shadow-xl border border-gray-700">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Download className="mr-3 text-brand-500" /> Backup Database
                  </h2>
                  <p className="text-gray-400 mb-6 text-sm">
                      Scarica periodicamente un backup dei dati per sicurezza.
                  </p>
                  
                  <div className="space-y-4">
                      <button 
                        onClick={exportDatabase}
                        className="w-full flex items-center justify-center bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded transition-colors"
                      >
                          <Download className="w-5 h-5 mr-2" /> Scarica Backup Dati (JSON)
                      </button>

                      <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-dark-800 text-gray-400">oppure Ripristina</span>
                          </div>
                      </div>

                      <button 
                        onClick={handleRestoreClick}
                        className="w-full flex items-center justify-center border border-gray-500 hover:border-brand-500 hover:text-brand-400 text-gray-300 font-bold py-4 rounded transition-colors"
                      >
                          <Upload className="w-5 h-5 mr-2" /> Carica File Backup
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        className="hidden"
                      />
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'questions' && (
          <div className="bg-dark-800 p-8 rounded-lg shadow-xl max-w-2xl mx-auto border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <List className="mr-3 text-brand-500" /> Editor Domande Extra
              </h2>
              <p className="text-gray-400 mb-6 text-sm">Crea domande personalizzate per il questionario.</p>
              
              <form onSubmit={handleAddQuestion} className="mb-8 border-b border-gray-700 pb-8 space-y-4">
                  <div>
                      <label className="block text-gray-400 text-sm mb-1">Testo della Domanda</label>
                      <input 
                        type="text" 
                        value={newQText}
                        onChange={(e) => setNewQText(e.target.value)}
                        className="w-full bg-dark-900 border border-gray-600 rounded p-3 text-white focus:border-brand-500 focus:outline-none"
                        placeholder="Es. Quante volte mangi fuori?"
                      />
                  </div>
                  
                  <div>
                      <label className="block text-gray-400 text-sm mb-1">Tipo di Risposta</label>
                      <select 
                        value={newQType} 
                        onChange={(e) => setNewQType(e.target.value as QuestionType)}
                        className="w-full bg-dark-900 border border-gray-600 rounded p-3 text-white focus:border-brand-500 focus:outline-none"
                      >
                          <option value="text">Testo Breve</option>
                          <option value="textarea">Testo Lungo</option>
                          <option value="radio">Scelta Singola (Radio)</option>
                          <option value="checkbox">Scelta Multipla (Checkbox)</option>
                          <option value="select">Menu a Tendina</option>
                      </select>
                  </div>

                  {(newQType === 'select' || newQType === 'radio' || newQType === 'checkbox') && (
                      <div>
                          <label className="block text-gray-400 text-sm mb-1">Opzioni (separate da virgola)</label>
                          <input 
                            type="text" 
                            value={newQOptions}
                            onChange={(e) => setNewQOptions(e.target.value)}
                            className="w-full bg-dark-900 border border-gray-600 rounded p-3 text-white focus:border-brand-500 focus:outline-none"
                            placeholder="Es. Mai, A volte, Spesso"
                          />
                      </div>
                  )}

                  <button type="submit" className="w-full bg-brand-600 py-3 rounded text-white font-bold hover:bg-brand-500 flex items-center justify-center">
                      <Plus className="w-5 h-5 mr-2" /> Aggiungi Domanda
                  </button>
              </form>

              <div className="space-y-3">
                  {customQuestions.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Nessuna domanda personalizzata aggiunta.</p>
                  ) : (
                      customQuestions.map(q => (
                          <div key={q.id} className="bg-dark-900 p-4 rounded flex justify-between items-center border border-gray-700">
                              <div>
                                <span className="text-white block font-medium">{q.text}</span>
                                <span className="text-xs text-brand-400 uppercase">{q.type}</span>
                                {q.options && <span className="text-xs text-gray-500 block">Opzioni: {q.options.join(', ')}</span>}
                              </div>
                              <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-400 hover:text-red-300 p-2">
                                  <Trash2 className="w-5 h-5" />
                              </button>
                          </div>
                      ))
                  )}
              </div>
          </div>
      )}

      {activeTab === 'submissions' && (
      <>
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-dark-800 p-4 rounded-lg border border-gray-700 gap-4">
            {/* Search */}
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Cerca cliente..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-dark-900 text-white pl-10 pr-4 py-2 rounded border border-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
            </div>
            
            {/* Actions */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                {selectedIds.size > 0 && (
                    <button 
                        onClick={generatePDF}
                        className="flex-1 md:flex-none flex items-center bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded font-bold transition-all shadow-lg shadow-brand-500/30 whitespace-nowrap"
                    >
                        <FileDown className="w-4 h-4 mr-2" /> 
                        Scarica PDF ({selectedIds.size})
                    </button>
                )}
                
                <button 
                    onClick={handleClearAll}
                    className="flex-1 md:flex-none flex items-center text-red-400 hover:text-red-300 px-3 py-2 rounded hover:bg-red-900/20 transition-colors whitespace-nowrap"
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Elimina Tutto
                </button>
            </div>
        </div>

        {/* List Header (Select All) */}
        {filteredSubmissions.length > 0 && (
            <div className="flex items-center mb-2 px-2">
                <button onClick={toggleSelectAll} className="flex items-center text-sm text-gray-400 hover:text-white">
                    {selectedIds.size === filteredSubmissions.length ? <CheckSquare className="w-5 h-5 mr-2 text-brand-500" /> : <Square className="w-5 h-5 mr-2" />}
                    Seleziona Tutti
                </button>
            </div>
        )}

        {/* List */}
        <div className="space-y-4">
            {filteredSubmissions.length === 0 ? (
                <div className="text-center py-20 bg-dark-800 rounded-lg border border-dashed border-gray-700">
                    <UserIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Nessun questionario trovato.</p>
                </div>
            ) : (
                filteredSubmissions.map((sub) => {
                    const isSelected = selectedIds.has(sub.id);
                    return (
                        <div key={sub.id} className={`bg-dark-800 rounded-lg border overflow-hidden shadow-lg transition-all ${isSelected ? 'border-brand-500 ring-1 ring-brand-500' : 'border-gray-700 hover:border-brand-500/50'}`}>
                            {/* Card Header */}
                            <div 
                                className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-center cursor-pointer hover:bg-dark-700/50"
                                onClick={() => toggleExpand(sub.id)}
                            >
                                <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
                                    {/* Checkbox */}
                                    <div onClick={(e) => toggleSelection(sub.id, e)} className="mr-4 cursor-pointer text-gray-400 hover:text-brand-500">
                                        {isSelected ? <CheckSquare className="w-6 h-6 text-brand-500" /> : <Square className="w-6 h-6" />}
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/30 shrink-0">
                                            {sub.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg md:text-xl font-bold text-white">{sub.fullName}</h3>
                                            <p className="text-gray-400 text-sm flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" /> 
                                                {new Date(sub.submissionDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full md:w-auto md:space-x-6">
                                    <div className="text-left md:text-right">
                                        <span className="block text-xs text-gray-500 uppercase">Obiettivo</span>
                                        <span className="text-brand-400 font-medium text-sm">
                                            {Object.entries(sub.goals).filter(([_, v]) => v).map(([k]) => k).slice(0, 2).join(', ') || 'Generico'}
                                        </span>
                                    </div>
                                    {expandedId === sub.id ? <ChevronUp className="text-gray-400 ml-4" /> : <ChevronDown className="text-gray-400 ml-4" />}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedId === sub.id && (
                                <div className="p-4 md:p-6 bg-dark-900/50 border-t border-gray-700">
                                    
                                    {/* Photos Grid */}
                                    {sub.photos.length > 0 && (
                                        <div className="mb-8 p-4 bg-black/40 rounded-lg border border-gray-800">
                                            <h4 className="text-white font-bold mb-4 flex items-center"><FileText className="w-4 h-4 mr-2" /> Foto Cliente</h4>
                                            <div className="flex gap-4 overflow-x-auto pb-2">
                                                {sub.photos.map((p, i) => (
                                                    <a key={i} href={p} target="_blank" rel="noreferrer">
                                                        <img src={p} className="h-40 rounded border border-gray-600 hover:border-brand-500 transition-colors" alt="client condition" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div>
                                            <h4 className="text-brand-500 font-bold mb-3 border-b border-gray-700 pb-1">Anagrafica & Info</h4>
                                            <DataRow label="Email" value={sub.email} />
                                            <DataRow label="Telefono" value={sub.phone} />
                                            <DataRow label="Età" value={sub.age} />
                                            <DataRow label="Altezza/Peso" value={`${sub.height}cm / ${sub.weight}kg`} />
                                            <DataRow label="Professione" value={sub.profession} />
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-brand-500 font-bold mb-3 border-b border-gray-700 pb-1">Salute & Stile di Vita</h4>
                                            <DataRow label="Patologie Cardiache" value={sub.heartProblems} />
                                            <DataRow label="Diabete" value={sub.diabetes} />
                                            <DataRow label="Dolori attuali" value={sub.currentPain} />
                                            <DataRow label="Infortuni passati" value={sub.pastInjuries} />
                                            <DataRow label="Fumo/Alcol" value={`${sub.smoker ? 'Sì' : 'No'} / ${sub.alcohol}`} />
                                            <DataRow label="Sonno" value={`${sub.sleepHours}h (${sub.sleepQuality})`} />
                                        </div>

                                        <div>
                                            <h4 className="text-brand-500 font-bold mb-3 border-b border-gray-700 pb-1">Allenamento & Obiettivi</h4>
                                            <DataRow label="Si allena?" value={sub.currentlyTraining} />
                                            <DataRow label="Frequenza" value={sub.frequency} />
                                            <DataRow label="Esperienza PT" value={sub.hashadTrainer} />
                                            <DataRow label="Preferenza Allenamento" value={sub.trainingPreference} />
                                            <DataRow label="Stile Trainer" value={sub.trainerStylePreference} />
                                            <DataRow label="Disponibilità" value={`${sub.weeklyAvailability} (per ${sub.timePerSession})`} />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-dark-800 p-4 rounded border border-gray-700">
                                            <h5 className="text-gray-300 font-bold mb-2">Descrizione Obiettivo</h5>
                                            <p className="text-white text-sm">{sub.mainGoalDescription || 'Nessuna descrizione.'}</p>
                                        </div>
                                        <div className="bg-dark-800 p-4 rounded border border-gray-700">
                                            <h5 className="text-gray-300 font-bold mb-2">Aspettative</h5>
                                            <p className="text-white text-sm">{sub.expectations || 'Nessuna aspettativa specificata.'}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Custom Answers Display */}
                                    {sub.customAnswers && Object.keys(sub.customAnswers).length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="text-brand-500 font-bold mb-3 border-b border-gray-700 pb-1">Risposte Extra</h4>
                                            <div className="bg-dark-800 p-4 rounded space-y-3 border border-gray-700">
                                                {Object.entries(sub.customAnswers).map(([qId, ans]) => {
                                                    const qText = customQuestions.find(cq => cq.id === qId)?.text || "Domanda Personalizzata (Rimossa)";
                                                    return (
                                                        <div key={qId}>
                                                            <span className="text-gray-400 text-sm block">{qText}</span>
                                                            <span className="text-white">{ans}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
      </>
      )}
    </div>
  );
};

export default AdminDashboard;