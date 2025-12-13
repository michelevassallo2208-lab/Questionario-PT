import React, { useState, useEffect, ChangeEvent } from 'react';
import { QuestionnaireData, initialQuestionnaire, CustomQuestion } from '../types';
import { Camera, Check, Upload, AlertCircle } from 'lucide-react';
import { getCustomQuestions } from '../utils';

interface Props {
  onSubmit: (data: QuestionnaireData) => void;
}

const QuestionnaireForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<QuestionnaireData>(initialQuestionnaire);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load custom defined questions
    setCustomQuestions(getCustomQuestions());
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCustomAnswerChange = (qId: string, value: string) => {
    setFormData(prev => ({
        ...prev,
        customAnswers: {
            ...prev.customAnswers,
            [qId]: value
        }
    }));
  };

  const handleNestedChange = (section: keyof QuestionnaireData, key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [key]: value
      }
    }));
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      if (files.length + formData.photos.length > 5) {
        alert("Massimo 5 foto permesse.");
        return;
      }

      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!formData.fullName) errs.push("Nome e Cognome sono obbligatori");
    if (!formData.email) errs.push("Email è obbligatoria");
    if (!formData.phone) errs.push("Telefono è obbligatorio");
    if (!formData.consent) errs.push("Devi accettare il consenso informato");
    
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      setTimeout(() => {
        onSubmit({
            ...formData,
            id: crypto.randomUUID(),
            submissionDate: new Date().toISOString()
        });
        setIsSubmitting(false);
      }, 1000);
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const SectionTitle = ({ num, title }: { num: string, title: string }) => (
    <h3 className="text-xl md:text-2xl font-bold text-brand-400 mt-10 mb-6 border-b border-gray-700 pb-2 flex items-center">
      <span className="bg-brand-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 shrink-0 shadow-lg shadow-brand-500/20">
        {num}
      </span>
      {title}
    </h3>
  );

  const InputLabel = ({ label, required }: { label: string, required?: boolean }) => (
    <label className="block text-gray-300 text-sm font-semibold mb-2">
      {label} {required && <span className="text-brand-400">*</span>}
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-dark-800 p-6 md:p-10 rounded-xl shadow-2xl border border-gray-700 relative overflow-hidden">
      
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600"></div>

      <div className="text-center mb-10">
        <div className="flex justify-center mb-6">
            <img src="logo.png" alt="Davide Carfora PT" className="h-20 md:h-24 object-contain" onError={(e) => {e.currentTarget.style.display = 'none'}} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Questionario Iniziale</h2>
        <p className="text-gray-400">Compila questo modulo per permettermi di creare il tuo piano perfetto.</p>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded mb-6 flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />
          <ul>
            {errors.map((err, idx) => <li key={idx}>{err}</li>)}
          </ul>
        </div>
      )}

      {/* 1. Dati Anagrafici */}
      <SectionTitle num="1" title="Dati Anagrafici" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><InputLabel label="Nome e Cognome" required /><input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
        <div><InputLabel label="Data di nascita" /><input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
        <div className="grid grid-cols-2 gap-4">
            <div><InputLabel label="Età" /><input name="age" type="number" value={formData.age} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
            <div><InputLabel label="Sesso" /><select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"><option value="">Seleziona</option><option value="M">M</option><option value="F">F</option></select></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div><InputLabel label="Altezza (cm)" /><input name="height" value={formData.height} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
            <div><InputLabel label="Peso (kg)" /><input name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
        </div>
        <div><InputLabel label="Email" required /><input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
        <div><InputLabel label="Telefono" required /><input name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
        <div className="md:col-span-2"><InputLabel label="Professione" /><input name="profession" value={formData.profession} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
      </div>

      {/* 2. Stato di Salute */}
      <SectionTitle num="2" title="Stato di Salute Generale" />
      <div className="space-y-4">
        <label className="flex items-center space-x-3 text-gray-300">
            <input type="checkbox" name="heartProblems" checked={formData.heartProblems} onChange={handleChange} className="w-5 h-5 accent-brand-500" />
            <span>Il medico ti ha mai diagnosticato problemi cardiaci?</span>
        </label>
        <div>
            <InputLabel label="Soffri di pressione alta o bassa?" />
            <select name="pressure" value={formData.pressure} onChange={handleChange} className="w-full md:w-1/3 bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="Normale">Normale</option>
                <option value="Alta">Alta</option>
                <option value="Bassa">Bassa</option>
            </select>
        </div>
        <label className="flex items-center space-x-3 text-gray-300">
            <input type="checkbox" name="cardioDiseases" checked={formData.cardioDiseases} onChange={handleChange} className="w-5 h-5 accent-brand-500" />
            <span>Hai mai avuto infarti, ictus o patologie cardiovascolari?</span>
        </label>
        <div>
            <InputLabel label="Soffri di diabete?" />
            <div className="flex space-x-4">
                {['No', 'Tipo 1', 'Tipo 2'].map(opt => (
                    <label key={opt} className="flex items-center space-x-2 text-gray-300">
                        <input type="radio" name="diabetes" value={opt} checked={formData.diabetes === opt} onChange={handleChange} className="accent-brand-500" />
                        <span>{opt}</span>
                    </label>
                ))}
            </div>
        </div>
        <label className="flex items-center space-x-3 text-gray-300">
            <input type="checkbox" name="respiratoryProblems" checked={formData.respiratoryProblems} onChange={handleChange} className="w-5 h-5 accent-brand-500" />
            <span>Hai problemi respiratori (asma, bronchite, ecc.)?</span>
        </label>
        <label className="flex items-center space-x-3 text-gray-300">
            <input type="checkbox" name="thyroidProblems" checked={formData.thyroidProblems} onChange={handleChange} className="w-5 h-5 accent-brand-500" />
            <span>Hai problemi alla tiroide?</span>
        </label>
        <div>
            <InputLabel label="Assumi farmaci regolarmente? Se sì, quali?" />
            <textarea name="medications" value={formData.medications} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 h-20" placeholder="Elenca farmaci..." />
        </div>
        <div>
            <InputLabel label="Hai allergie rilevanti?" />
            <input name="allergies" value={formData.allergies} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <label className="flex items-center space-x-3 text-gray-300">
            <input type="checkbox" name="surgeries" checked={formData.surgeries} onChange={handleChange} className="w-5 h-5 accent-brand-500" />
            <span>Hai subito interventi chirurgici negli ultimi 2 anni?</span>
        </label>
      </div>

      {/* 3. Apparato Muscolo-Scheletrico */}
      <SectionTitle num="3" title="Apparato Muscolo-Scheletrico" />
      <div className="space-y-4">
        <label className="flex items-center space-x-3 text-gray-300 font-semibold">
            <input type="checkbox" name="currentPain" checked={formData.currentPain} onChange={handleChange} className="w-5 h-5 accent-brand-500" />
            <span>Avverti dolori muscolari o articolari attualmente?</span>
        </label>
        
        <div className="bg-dark-900 p-4 rounded border border-gray-700">
            <InputLabel label="Hai o hai avuto problemi a:" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <label className="flex items-center space-x-2 text-gray-400"><input type="checkbox" name="spineIssues" checked={formData.spineIssues} onChange={handleChange} className="accent-brand-500" /> <span>Colonna vertebrale</span></label>
                <label className="flex items-center space-x-2 text-gray-400"><input type="checkbox" name="shoulderIssues" checked={formData.shoulderIssues} onChange={handleChange} className="accent-brand-500" /> <span>Spalle</span></label>
                <label className="flex items-center space-x-2 text-gray-400"><input type="checkbox" name="kneeIssues" checked={formData.kneeIssues} onChange={handleChange} className="accent-brand-500" /> <span>Ginocchia</span></label>
                <label className="flex items-center space-x-2 text-gray-400"><input type="checkbox" name="hipIssues" checked={formData.hipIssues} onChange={handleChange} className="accent-brand-500" /> <span>Anche</span></label>
                <label className="flex items-center space-x-2 text-gray-400"><input type="checkbox" name="ankleIssues" checked={formData.ankleIssues} onChange={handleChange} className="accent-brand-500" /> <span>Caviglie / Piedi</span></label>
            </div>
        </div>
        
        <div><InputLabel label="Hai mai subito infortuni sportivi? (Quali e quando)" /><textarea name="pastInjuries" value={formData.pastInjuries} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 h-20" /></div>
        <div><InputLabel label="Ci sono movimenti o esercizi che ti provocano dolore?" /><textarea name="painfulMovements" value={formData.painfulMovements} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 h-20" /></div>
      </div>

      {/* 4. Livello di Attività Fisica */}
      <SectionTitle num="4" title="Livello di Attività Fisica" />
      <div className="space-y-4">
         <label className="flex items-center space-x-3 text-gray-300">
            <input type="checkbox" name="currentlyTraining" checked={formData.currentlyTraining} onChange={handleChange} className="w-5 h-5 accent-brand-500" />
            <span>Ti alleni attualmente?</span>
        </label>
        {formData.currentlyTraining && (
            <div><InputLabel label="Da quanto tempo?" /><input name="trainingSince" value={formData.trainingSince} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
        )}
        <div><InputLabel label="Quante volte a settimana ti alleni?" /><input name="frequency" value={formData.frequency} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
        
        <div className="bg-dark-900 p-4 rounded border border-gray-700">
             <InputLabel label="Che tipo di attività svolgi?" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                 <label className="flex items-center space-x-2 text-gray-400"><input type="checkbox" checked={formData.activityType.weights} onChange={(e) => handleNestedChange('activityType', 'weights', e.target.checked)} className="accent-brand-500" /> <span>Pesi</span></label>
                 <label className="flex items-center space-x-2 text-gray-400"><input type="checkbox" checked={formData.activityType.cardio} onChange={(e) => handleNestedChange('activityType', 'cardio', e.target.checked)} className="accent-brand-500" /> <span>Cardio</span></label>
                 <label className="flex items-center space-x-2 text-gray-400"><input type="checkbox" checked={formData.activityType.sports} onChange={(e) => handleNestedChange('activityType', 'sports', e.target.checked)} className="accent-brand-500" /> <span>Sport Specifici</span></label>
             </div>
             <div className="mt-2"><InputLabel label="Altro" /><input value={formData.activityType.other} onChange={(e) => handleNestedChange('activityType', 'other', e.target.value)} className="w-full bg-dark-900 text-white rounded p-2 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
        </div>
        <div><InputLabel label="Da quanto tempo pratichi attività fisica in modo continuativo?" /><input name="continuousActivityDuration" value={formData.continuousActivityDuration} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
      </div>

      {/* 5. Esperienze Pregresse */}
      <SectionTitle num="5" title="Esperienze Pregresse" />
      <div className="space-y-4">
        <label className="flex items-center space-x-3 text-gray-300">
            <input type="checkbox" name="hashadTrainer" checked={formData.hashadTrainer} onChange={handleChange} className="w-5 h-5 accent-brand-500" />
            <span>Hai già seguito programmi con un PT?</span>
        </label>
        <div><InputLabel label="Cosa ti è piaciuto o non piaciuto?" /><textarea name="experienceFeedback" value={formData.experienceFeedback} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 h-20" /></div>
        <label className="flex items-center space-x-3 text-gray-300">
            <input type="checkbox" name="interruptedTraining" checked={formData.interruptedTraining} onChange={handleChange} className="w-5 h-5 accent-brand-500" />
            <span>Hai mai interrotto un percorso?</span>
        </label>
        {formData.interruptedTraining && (
            <div><InputLabel label="Motivo dell'interruzione" /><input name="interruptionReason" value={formData.interruptionReason} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
        )}
      </div>

      {/* 6. Stile di Vita */}
      <SectionTitle num="6" title="Stile di Vita" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><InputLabel label="Ore di sonno per notte" /><input name="sleepHours" value={formData.sleepHours} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
        <div>
            <InputLabel label="Qualità del sonno" />
            <select name="sleepQuality" value={formData.sleepQuality} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="Scarsa">Scarsa</option>
                <option value="Media">Media</option>
                <option value="Buona">Buona</option>
            </select>
        </div>
        <div><InputLabel label="Livello Stress (1-10)" /><input type="number" min="1" max="10" name="stressLevel" value={formData.stressLevel} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
        <div>
            <InputLabel label="Tipo di lavoro" />
            <select name="jobActivity" value={formData.jobActivity} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="Sedentario">Sedentario</option>
                <option value="Attivo">Attivo</option>
                <option value="Molto fisico">Molto fisico</option>
            </select>
        </div>
        <label className="flex items-center space-x-3 text-gray-300">
            <input type="checkbox" name="smoker" checked={formData.smoker} onChange={handleChange} className="w-5 h-5 accent-brand-500" />
            <span>Fumi?</span>
        </label>
         <div>
            <InputLabel label="Consumi Alcol?" />
            <select name="alcohol" value={formData.alcohol} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="No">No</option>
                <option value="Occasionalmente">Occasionalmente</option>
                <option value="Regolarmente">Regolarmente</option>
            </select>
        </div>
      </div>

      {/* 7. Alimentazione */}
      <SectionTitle num="7" title="Alimentazione" />
      <div className="space-y-4">
        <label className="flex items-center space-x-3 text-gray-300">
            <input type="checkbox" name="followsDiet" checked={formData.followsDiet} onChange={handleChange} className="w-5 h-5 accent-brand-500" />
            <span>Segui un piano alimentare strutturato?</span>
        </label>
        <div><InputLabel label="Restrizioni o intolleranze" /><input name="foodIntolerances" value={formData.foodIntolerances} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
        <div><InputLabel label="Quanti pasti fai al giorno?" /><input name="mealsPerDay" value={formData.mealsPerDay} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
        <label className="flex items-center space-x-3 text-gray-300">
            <input type="checkbox" name="drinksWater" checked={formData.drinksWater} onChange={handleChange} className="w-5 h-5 accent-brand-500" />
            <span>Bevi almeno 1.5-2L di acqua al giorno?</span>
        </label>
        <div>
            <InputLabel label="Come valuti la tua alimentazione?" />
            <select name="dietQuality" value={formData.dietQuality} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="Scarsa">Scarsa</option>
                <option value="Discreta">Discreta</option>
                <option value="Buona">Buona</option>
            </select>
        </div>
      </div>

      {/* 8. Obiettivi */}
      <SectionTitle num="8" title="Obiettivi" />
      <div className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-2 text-gray-300"><input type="checkbox" checked={formData.goals.weightLoss} onChange={(e) => handleNestedChange('goals', 'weightLoss', e.target.checked)} className="accent-brand-500" /> <span>Dimagrimento</span></label>
            <label className="flex items-center space-x-2 text-gray-300"><input type="checkbox" checked={formData.goals.muscleGain} onChange={(e) => handleNestedChange('goals', 'muscleGain', e.target.checked)} className="accent-brand-500" /> <span>Aumento Massa</span></label>
            <label className="flex items-center space-x-2 text-gray-300"><input type="checkbox" checked={formData.goals.toning} onChange={(e) => handleNestedChange('goals', 'toning', e.target.checked)} className="accent-brand-500" /> <span>Tonificazione</span></label>
            <label className="flex items-center space-x-2 text-gray-300"><input type="checkbox" checked={formData.goals.strength} onChange={(e) => handleNestedChange('goals', 'strength', e.target.checked)} className="accent-brand-500" /> <span>Forza</span></label>
            <label className="flex items-center space-x-2 text-gray-300"><input type="checkbox" checked={formData.goals.endurance} onChange={(e) => handleNestedChange('goals', 'endurance', e.target.checked)} className="accent-brand-500" /> <span>Resistenza</span></label>
            <label className="flex items-center space-x-2 text-gray-300"><input type="checkbox" checked={formData.goals.wellness} onChange={(e) => handleNestedChange('goals', 'wellness', e.target.checked)} className="accent-brand-500" /> <span>Benessere</span></label>
            <label className="flex items-center space-x-2 text-gray-300"><input type="checkbox" checked={formData.goals.rehab} onChange={(e) => handleNestedChange('goals', 'rehab', e.target.checked)} className="accent-brand-500" /> <span>Post-Infortunio</span></label>
            <label className="flex items-center space-x-2 text-gray-300"><input type="checkbox" checked={formData.goals.sportPerformance} onChange={(e) => handleNestedChange('goals', 'sportPerformance', e.target.checked)} className="accent-brand-500" /> <span>Prestazione Sportiva</span></label>
         </div>
         <div><InputLabel label="Descrivi il tuo obiettivo principale con parole tue:" /><textarea name="mainGoalDescription" value={formData.mainGoalDescription} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 h-24" /></div>
      </div>

      {/* 9. Disponibilità */}
      <SectionTitle num="9" title="Disponibilità e Impegno" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><InputLabel label="Quante volte a settimana puoi allenarti?" /><input name="weeklyAvailability" value={formData.weeklyAvailability} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
        <div><InputLabel label="Tempo per allenamento?" /><input name="timePerSession" value={formData.timePerSession} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
        <div><InputLabel label="Data evento obiettivo (se presente)" /><input name="deadlineEvent" value={formData.deadlineEvent} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
        <div><InputLabel label="Quanto sei disposto a impegnarti (1-10)?" /><input type="number" min="1" max="10" name="commitmentLevel" value={formData.commitmentLevel} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
      </div>

      {/* 10. Aspettative */}
      <SectionTitle num="10" title="Aspettative dal Trainer" />
      <div className="space-y-4">
        <div><InputLabel label="Cosa ti aspetti da me?" /><textarea name="expectations" value={formData.expectations} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 h-24" /></div>
        <div>
            <InputLabel label="Preferisci allenamenti:" />
            <select name="trainingPreference" value={formData.trainingPreference} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                {['Intensi', 'Graduali', 'Vari', 'Tecnici'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
         <div>
            <InputLabel label="Preferisci maggiormente:" />
            <select name="trainerStylePreference" value={formData.trainerStylePreference} onChange={handleChange} className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                {['Motivazione', 'Controllo tecnico', 'Educazione'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
      </div>

        {/* Custom Questions Section (Dynamic) */}
        {customQuestions.length > 0 && (
            <>
                <SectionTitle num="Extra" title="Domande Aggiuntive" />
                <div className="space-y-6">
                    {customQuestions.map((q) => (
                        <div key={q.id}>
                            <InputLabel label={q.text} />
                            <textarea 
                                value={formData.customAnswers[q.id] || ''} 
                                onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)} 
                                className="w-full bg-dark-900 text-white rounded p-3 border border-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 h-20"
                            />
                        </div>
                    ))}
                </div>
            </>
        )}

       {/* Foto */}
       <SectionTitle num="Foto" title="Foto della Condizione Attuale" />
       <div className="bg-dark-900 p-6 rounded border border-gray-700 text-center">
            <p className="text-gray-400 mb-4 text-sm">Carica le tue foto (Fronte, Retro, Lato) per una valutazione completa. (Max 5 foto)</p>
            <div className="flex flex-wrap gap-4 justify-center mb-4">
                {formData.photos.map((photo, idx) => (
                    <img key={idx} src={photo} alt="preview" className="w-24 h-32 object-cover rounded border border-brand-500" />
                ))}
            </div>
            <label className="cursor-pointer inline-flex items-center space-x-2 bg-dark-800 hover:bg-dark-700 text-white px-4 py-2 rounded border border-gray-500 transition-colors">
                <Upload className="w-5 h-5" />
                <span>Carica Foto</span>
                <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
       </div>


      {/* 11. Consenso */}
      <SectionTitle num="11" title="Consenso Informato" />
      <div className="border border-brand-500/30 bg-brand-500/5 p-6 rounded">
        <label className="flex items-start space-x-3 cursor-pointer">
             <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} className="w-6 h-6 mt-1 accent-brand-500 shrink-0" />
             <span className="text-gray-300 text-sm">
                Dichiaro che le informazioni fornite sono veritiere e autorizzo il trattamento dei dati personali ai fini della programmazione dell’attività di personal training presso lo studio <strong>Davide Carfora PT</strong>.
             </span>
        </label>
      </div>

      <div className="mt-10 flex justify-end">
        <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 px-10 rounded-lg text-lg flex items-center shadow-lg shadow-brand-500/30 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isSubmitting ? 'Invio in corso...' : 'Invia Questionario'}
            {!isSubmitting && <Check className="ml-2 w-6 h-6" />}
        </button>
      </div>
    </form>
  );
};

export default QuestionnaireForm;