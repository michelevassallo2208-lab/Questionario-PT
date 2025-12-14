import React, { useState, useEffect, ChangeEvent } from 'react';
import { QuestionnaireData, initialQuestionnaire, CustomQuestion } from '../types';
import { Camera, Check, Upload, AlertCircle, ChevronRight } from 'lucide-react';
import { getCustomQuestions } from '../utils';

interface Props {
  onSubmit: (data: QuestionnaireData) => void;
}

// --- STYLED COMPONENTS ---

const SectionTitle = ({ num, title }: { num: string, title: string }) => (
  <div className="mt-12 mb-8 relative">
      <div className="absolute left-0 top-1/2 w-full h-px bg-white/10 -z-10"></div>
      <h3 className="text-xl md:text-2xl font-bold text-white inline-flex items-center bg-dark-900/40 pr-4 backdrop-blur-sm rounded-r-full">
          <span className="bg-gradient-to-br from-brand-500 to-brand-700 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-4 shadow-[0_0_15px_rgba(59,130,246,0.5)] shrink-0 border border-white/10">
              {num}
          </span>
          {title}
      </h3>
  </div>
);

const InputLabel = ({ label, required }: { label: string, required?: boolean }) => (
  <label className="block text-gray-300 text-sm font-semibold mb-3 tracking-wide">
    {label} {required && <span className="text-brand-400">*</span>}
  </label>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
      {...props} 
      className="w-full bg-black/40 text-white rounded-lg px-4 py-4 border border-white/10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder-gray-600 text-base shadow-inner" 
  />
);

const StyledSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative">
      <select 
          {...props} 
          className="w-full bg-black/40 text-white rounded-lg px-4 py-4 border border-white/10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all appearance-none text-base shadow-inner"
      >
          {props.children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
          <ChevronRight className="w-5 h-5 rotate-90" />
      </div>
  </div>
);

const StyledTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
      {...props}
      className="w-full bg-black/40 text-white rounded-lg px-4 py-4 border border-white/10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder-gray-600 text-base shadow-inner min-h-[100px]"
    />
);

interface StyledCheckboxProps {
    checked: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    label: string;
    name?: string;
}

const StyledCheckbox: React.FC<StyledCheckboxProps> = ({ checked, onChange, label, name }) => (
    <label className={`flex items-start p-4 rounded-lg border transition-all cursor-pointer group ${checked ? 'bg-brand-900/20 border-brand-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
            <input 
              type="checkbox" 
              name={name} 
              checked={checked} 
              onChange={onChange} 
              className="peer appearance-none w-6 h-6 border-2 border-gray-500 rounded bg-transparent checked:bg-brand-500 checked:border-brand-500 transition-colors"
            />
            <Check className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
        </div>
        <span className={`ml-3 text-base ${checked ? 'text-white font-medium' : 'text-gray-300 group-hover:text-white'}`}>{label}</span>
    </label>
);

interface StyledRadioProps {
    checked: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    label: string;
    name: string;
    value: string;
}

const StyledRadio: React.FC<StyledRadioProps> = ({ checked, onChange, label, name, value }) => (
  <label className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer group ${checked ? 'bg-brand-900/20 border-brand-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
      <div className="relative flex items-center justify-center shrink-0">
          <input 
            type="radio" 
            name={name} 
            value={value}
            checked={checked} 
            onChange={onChange} 
            className="peer appearance-none w-6 h-6 border-2 border-gray-500 rounded-full bg-transparent checked:border-brand-500 transition-colors"
          />
          <div className="absolute w-3 h-3 bg-brand-500 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
      </div>
      <span className={`ml-3 text-base ${checked ? 'text-white font-medium' : 'text-gray-300 group-hover:text-white'}`}>{label}</span>
  </label>
);

const QuestionnaireForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<QuestionnaireData>(initialQuestionnaire);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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

  const handleCustomCheckboxChange = (qId: string, option: string, checked: boolean) => {
      setFormData(prev => {
          const currentVal = prev.customAnswers[qId] ? prev.customAnswers[qId].split(', ') : [];
          let newVal;
          if (checked) {
              newVal = [...currentVal, option];
          } else {
              newVal = currentVal.filter(v => v !== option);
          }
          return {
              ...prev,
              customAnswers: {
                  ...prev.customAnswers,
                  [qId]: newVal.join(', ')
              }
          }
      });
  }

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

  const renderCustomInput = (q: CustomQuestion) => {
      const val = formData.customAnswers[q.id] || '';

      switch (q.type) {
          case 'textarea':
              return <StyledTextarea value={val} onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)} />;
          case 'select':
              return (
                  <StyledSelect value={val} onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}>
                      <option value="">Seleziona...</option>
                      {q.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </StyledSelect>
              );
          case 'radio':
              return (
                  <div className="space-y-3 mt-3">
                      {q.options?.map(opt => (
                          <StyledRadio 
                             key={opt}
                             label={opt}
                             name={`custom-${q.id}`}
                             value={opt}
                             checked={val === opt}
                             onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                          />
                      ))}
                  </div>
              );
            case 'checkbox':
                const currentVals = val ? val.split(', ') : [];
                return (
                    <div className="space-y-3 mt-3">
                        {q.options?.map(opt => (
                            <StyledCheckbox 
                                key={opt}
                                label={opt}
                                checked={currentVals.includes(opt)}
                                onChange={(e) => handleCustomCheckboxChange(q.id, opt, e.target.checked)}
                            />
                        ))}
                    </div>
                );
          case 'text':
          default:
              return <StyledInput value={val} onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)} />;
      }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-dark-900/60 backdrop-blur-xl p-6 md:p-10 rounded-2xl shadow-2xl border border-white/5 relative">
      
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600 rounded-t-2xl"></div>

      <div className="text-center mb-10 mt-2">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Questionario Iniziale</h2>
        <p className="text-gray-400 text-lg">Compila questo modulo per permettermi di creare il tuo piano perfetto.</p>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8 flex items-start animate-pulse">
          <AlertCircle className="w-6 h-6 mr-3 mt-0.5 shrink-0" />
          <ul className="list-disc list-inside">
            {errors.map((err, idx) => <li key={idx}>{err}</li>)}
          </ul>
        </div>
      )}

      {/* 1. Dati Anagrafici */}
      <SectionTitle num="1" title="Dati Anagrafici" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2"><InputLabel label="Nome e Cognome" required /><StyledInput name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Es. Mario Rossi" /></div>
        <div><InputLabel label="Data di nascita" /><StyledInput type="date" name="dob" value={formData.dob} onChange={handleChange} /></div>
        <div className="grid grid-cols-2 gap-4">
            <div><InputLabel label="Età" /><StyledInput name="age" type="number" value={formData.age} onChange={handleChange} /></div>
            <div><InputLabel label="Sesso" />
                <StyledSelect name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">...</option><option value="M">M</option><option value="F">F</option>
                </StyledSelect>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div><InputLabel label="Altezza (cm)" /><StyledInput name="height" value={formData.height} onChange={handleChange} /></div>
            <div><InputLabel label="Peso (kg)" /><StyledInput name="weight" value={formData.weight} onChange={handleChange} /></div>
        </div>
        <div className="md:col-span-2"><InputLabel label="Email" required /><StyledInput name="email" type="email" value={formData.email} onChange={handleChange} placeholder="nome@esempio.com" /></div>
        <div className="md:col-span-2"><InputLabel label="Telefono" required /><StyledInput name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+39 ..." /></div>
        <div className="md:col-span-2"><InputLabel label="Professione" /><StyledInput name="profession" value={formData.profession} onChange={handleChange} /></div>
      </div>

      {/* 2. Stato di Salute */}
      <SectionTitle num="2" title="Stato di Salute" />
      <div className="space-y-6">
        <StyledCheckbox name="heartProblems" label="Il medico ti ha mai diagnosticato problemi cardiaci?" checked={formData.heartProblems} onChange={handleChange} />
        
        <div>
            <InputLabel label="Pressione sanguigna" />
            <StyledSelect name="pressure" value={formData.pressure} onChange={handleChange}>
                <option value="Normale">Normale</option>
                <option value="Alta">Alta</option>
                <option value="Bassa">Bassa</option>
            </StyledSelect>
        </div>
        
        <StyledCheckbox name="cardioDiseases" label="Hai mai avuto infarti, ictus o patologie cardiovascolari?" checked={formData.cardioDiseases} onChange={handleChange} />
        
        <div className="bg-white/5 p-5 rounded-xl border border-white/5">
            <InputLabel label="Soffri di diabete?" />
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
                {['No', 'Tipo 1', 'Tipo 2'].map(opt => (
                     <StyledRadio key={opt} name="diabetes" value={opt} label={opt} checked={formData.diabetes === opt} onChange={handleChange} />
                ))}
            </div>
        </div>

        <StyledCheckbox name="respiratoryProblems" label="Hai problemi respiratori (asma, ecc.)?" checked={formData.respiratoryProblems} onChange={handleChange} />
        <StyledCheckbox name="thyroidProblems" label="Hai problemi alla tiroide?" checked={formData.thyroidProblems} onChange={handleChange} />
        
        <div>
            <InputLabel label="Assumi farmaci regolarmente?" />
            <StyledTextarea name="medications" value={formData.medications} onChange={handleChange} placeholder="Se sì, quali?" />
        </div>
        <div>
            <InputLabel label="Allergie rilevanti?" />
            <StyledInput name="allergies" value={formData.allergies} onChange={handleChange} />
        </div>
        <StyledCheckbox name="surgeries" label="Interventi chirurgici negli ultimi 2 anni?" checked={formData.surgeries} onChange={handleChange} />
      </div>

      {/* 3. Muscolo-Scheletrico */}
      <SectionTitle num="3" title="Muscolo-Scheletrico" />
      <div className="space-y-6">
        <StyledCheckbox name="currentPain" label="Avverti dolori muscolari/articolari attualmente?" checked={formData.currentPain} onChange={handleChange} />
        
        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
            <InputLabel label="Hai o hai avuto problemi a:" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <StyledCheckbox name="spineIssues" label="Colonna vertebrale" checked={formData.spineIssues} onChange={handleChange} />
                <StyledCheckbox name="shoulderIssues" label="Spalle" checked={formData.shoulderIssues} onChange={handleChange} />
                <StyledCheckbox name="kneeIssues" label="Ginocchia" checked={formData.kneeIssues} onChange={handleChange} />
                <StyledCheckbox name="hipIssues" label="Anche" checked={formData.hipIssues} onChange={handleChange} />
                <StyledCheckbox name="ankleIssues" label="Caviglie / Piedi" checked={formData.ankleIssues} onChange={handleChange} />
            </div>
        </div>
        
        <div><InputLabel label="Infortuni sportivi passati?" /><StyledTextarea name="pastInjuries" value={formData.pastInjuries} onChange={handleChange} placeholder="Quali e quando..." /></div>
        <div><InputLabel label="Movimenti che provocano dolore?" /><StyledTextarea name="painfulMovements" value={formData.painfulMovements} onChange={handleChange} /></div>
      </div>

      {/* 4. Attività Fisica */}
      <SectionTitle num="4" title="Attività Fisica" />
      <div className="space-y-6">
         <StyledCheckbox name="currentlyTraining" label="Ti alleni attualmente?" checked={formData.currentlyTraining} onChange={handleChange} />
        
        {formData.currentlyTraining && (
            <div className="animate-fade-in"><InputLabel label="Da quanto tempo?" /><StyledInput name="trainingSince" value={formData.trainingSince} onChange={handleChange} /></div>
        )}
        
        <div><InputLabel label="Quante volte a settimana?" /><StyledInput name="frequency" value={formData.frequency} onChange={handleChange} /></div>
        
        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
             <InputLabel label="Tipo di attività attuale" />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                 <StyledCheckbox label="Pesi" checked={formData.activityType.weights} onChange={(e) => handleNestedChange('activityType', 'weights', e.target.checked)} />
                 <StyledCheckbox label="Cardio" checked={formData.activityType.cardio} onChange={(e) => handleNestedChange('activityType', 'cardio', e.target.checked)} />
                 <StyledCheckbox label="Sport Specifici" checked={formData.activityType.sports} onChange={(e) => handleNestedChange('activityType', 'sports', e.target.checked)} />
             </div>
             <div className="mt-4"><InputLabel label="Altro" /><StyledInput value={formData.activityType.other} onChange={(e) => handleNestedChange('activityType', 'other', e.target.value)} /></div>
        </div>
        
        <div><InputLabel label="Da quanto pratichi attività continuativa?" /><StyledInput name="continuousActivityDuration" value={formData.continuousActivityDuration} onChange={handleChange} /></div>
      </div>

      {/* 5. Esperienze */}
      <SectionTitle num="5" title="Esperienze" />
      <div className="space-y-6">
        <StyledCheckbox name="hashadTrainer" label="Hai già avuto un Personal Trainer?" checked={formData.hashadTrainer} onChange={handleChange} />
        <div><InputLabel label="Feedback esperienze precedenti" /><StyledTextarea name="experienceFeedback" value={formData.experienceFeedback} onChange={handleChange} placeholder="Cosa ti è piaciuto o non ti è piaciuto?" /></div>
        
        <StyledCheckbox name="interruptedTraining" label="Hai mai interrotto un percorso?" checked={formData.interruptedTraining} onChange={handleChange} />
        {formData.interruptedTraining && (
            <div className="animate-fade-in"><InputLabel label="Motivo dell'interruzione" /><StyledInput name="interruptionReason" value={formData.interruptionReason} onChange={handleChange} /></div>
        )}
      </div>

      {/* 6. Stile di Vita */}
      <SectionTitle num="6" title="Stile di Vita" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><InputLabel label="Ore di sonno" /><StyledInput name="sleepHours" value={formData.sleepHours} onChange={handleChange} /></div>
        <div>
            <InputLabel label="Qualità del sonno" />
            <StyledSelect name="sleepQuality" value={formData.sleepQuality} onChange={handleChange}>
                <option value="Scarsa">Scarsa</option>
                <option value="Media">Media</option>
                <option value="Buona">Buona</option>
            </StyledSelect>
        </div>
        <div><InputLabel label="Stress (1-10)" /><StyledInput type="number" min="1" max="10" name="stressLevel" value={formData.stressLevel} onChange={handleChange} /></div>
        <div>
            <InputLabel label="Tipo di lavoro" />
            <StyledSelect name="jobActivity" value={formData.jobActivity} onChange={handleChange}>
                <option value="Sedentario">Sedentario</option>
                <option value="Attivo">Attivo</option>
                <option value="Molto fisico">Molto fisico</option>
            </StyledSelect>
        </div>
        <div className="md:col-span-2">
            <StyledCheckbox name="smoker" label="Fumi?" checked={formData.smoker} onChange={handleChange} />
        </div>
         <div className="md:col-span-2">
            <InputLabel label="Consumo Alcol" />
            <StyledSelect name="alcohol" value={formData.alcohol} onChange={handleChange}>
                <option value="No">No</option>
                <option value="Occasionalmente">Occasionalmente</option>
                <option value="Regolarmente">Regolarmente</option>
            </StyledSelect>
        </div>
      </div>

      {/* 7. Alimentazione */}
      <SectionTitle num="7" title="Alimentazione" />
      <div className="space-y-6">
        <StyledCheckbox name="followsDiet" label="Segui già una dieta?" checked={formData.followsDiet} onChange={handleChange} />
        <div><InputLabel label="Intolleranze / Restrizioni" /><StyledInput name="foodIntolerances" value={formData.foodIntolerances} onChange={handleChange} /></div>
        <div><InputLabel label="Pasti al giorno" /><StyledInput name="mealsPerDay" value={formData.mealsPerDay} onChange={handleChange} /></div>
        <StyledCheckbox name="drinksWater" label="Bevi almeno 1.5L di acqua?" checked={formData.drinksWater} onChange={handleChange} />
        <div>
            <InputLabel label="Qualità alimentazione percepita" />
            <StyledSelect name="dietQuality" value={formData.dietQuality} onChange={handleChange}>
                <option value="Scarsa">Scarsa</option>
                <option value="Discreta">Discreta</option>
                <option value="Buona">Buona</option>
            </StyledSelect>
        </div>
      </div>

      {/* 8. Obiettivi */}
      <SectionTitle num="8" title="Obiettivi" />
      <div className="space-y-6">
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StyledCheckbox label="Dimagrimento" checked={formData.goals.weightLoss} onChange={(e) => handleNestedChange('goals', 'weightLoss', e.target.checked)} />
            <StyledCheckbox label="Aumento Massa" checked={formData.goals.muscleGain} onChange={(e) => handleNestedChange('goals', 'muscleGain', e.target.checked)} />
            <StyledCheckbox label="Tonificazione" checked={formData.goals.toning} onChange={(e) => handleNestedChange('goals', 'toning', e.target.checked)} />
            <StyledCheckbox label="Forza" checked={formData.goals.strength} onChange={(e) => handleNestedChange('goals', 'strength', e.target.checked)} />
            <StyledCheckbox label="Resistenza" checked={formData.goals.endurance} onChange={(e) => handleNestedChange('goals', 'endurance', e.target.checked)} />
            <StyledCheckbox label="Benessere" checked={formData.goals.wellness} onChange={(e) => handleNestedChange('goals', 'wellness', e.target.checked)} />
            <StyledCheckbox label="Post-Infortunio" checked={formData.goals.rehab} onChange={(e) => handleNestedChange('goals', 'rehab', e.target.checked)} />
            <StyledCheckbox label="Prestazione Sportiva" checked={formData.goals.sportPerformance} onChange={(e) => handleNestedChange('goals', 'sportPerformance', e.target.checked)} />
         </div>
         <div><InputLabel label="Descrivi il tuo obiettivo principale" /><StyledTextarea name="mainGoalDescription" value={formData.mainGoalDescription} onChange={handleChange} className="h-32" /></div>
      </div>

      {/* 9. Disponibilità */}
      <SectionTitle num="9" title="Disponibilità" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><InputLabel label="Giorni a settimana" /><StyledInput name="weeklyAvailability" value={formData.weeklyAvailability} onChange={handleChange} /></div>
        <div><InputLabel label="Minuti per sessione" /><StyledInput name="timePerSession" value={formData.timePerSession} onChange={handleChange} /></div>
        <div className="md:col-span-2"><InputLabel label="Eventuale scadenza (evento/data)" /><StyledInput name="deadlineEvent" value={formData.deadlineEvent} onChange={handleChange} /></div>
        <div className="md:col-span-2"><InputLabel label="Impegno (1-10)" /><StyledInput type="number" min="1" max="10" name="commitmentLevel" value={formData.commitmentLevel} onChange={handleChange} /></div>
      </div>

      {/* 10. Aspettative */}
      <SectionTitle num="10" title="Aspettative" />
      <div className="space-y-6">
        <div><InputLabel label="Cosa ti aspetti dal percorso?" /><StyledTextarea name="expectations" value={formData.expectations} onChange={handleChange} /></div>
        <div>
            <InputLabel label="Preferenza allenamenti" />
            <StyledSelect name="trainingPreference" value={formData.trainingPreference} onChange={handleChange}>
                {['Intensi', 'Graduali', 'Vari', 'Tecnici'].map(o => <option key={o} value={o}>{o}</option>)}
            </StyledSelect>
        </div>
         <div>
            <InputLabel label="Stile del Trainer preferito" />
            <StyledSelect name="trainerStylePreference" value={formData.trainerStylePreference} onChange={handleChange}>
                {['Motivazione', 'Controllo tecnico', 'Educazione'].map(o => <option key={o} value={o}>{o}</option>)}
            </StyledSelect>
        </div>
      </div>

        {/* Custom Questions Section (Dynamic) */}
        {customQuestions.length > 0 && (
            <>
                <SectionTitle num="+" title="Domande Extra" />
                <div className="space-y-8">
                    {customQuestions.map((q) => (
                        <div key={q.id} className="animate-fade-in">
                            <InputLabel label={q.text} />
                            {renderCustomInput(q)}
                        </div>
                    ))}
                </div>
            </>
        )}

       {/* Foto */}
       <SectionTitle num="Img" title="Foto Condizione" />
       <div className="bg-black/30 backdrop-blur-md p-8 rounded-2xl border border-dashed border-gray-600 text-center hover:border-brand-500 transition-colors">
            <Camera className="w-10 h-10 mx-auto text-brand-500 mb-4" />
            <p className="text-gray-300 mb-2 font-medium">Carica le tue foto (Fronte, Retro, Lato)</p>
            <p className="text-gray-500 text-sm mb-6">Massimo 5 foto. Formati: JPG, PNG.</p>
            
            <div className="flex flex-wrap gap-4 justify-center mb-6">
                {formData.photos.map((photo, idx) => (
                    <div key={idx} className="relative group">
                        <img src={photo} alt="preview" className="w-24 h-32 object-cover rounded-lg border border-white/20 shadow-lg" />
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Check className="text-brand-400 w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>
            
            <label className="cursor-pointer inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-full font-bold transition-transform transform hover:scale-105 shadow-lg shadow-brand-500/20">
                <Upload className="w-5 h-5" />
                <span>Seleziona Foto</span>
                <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
       </div>


      {/* 11. Consenso */}
      <div className="mt-12 bg-brand-900/10 border border-brand-500/20 p-6 rounded-2xl">
        <label className="flex items-start space-x-4 cursor-pointer">
             <div className="relative flex items-center justify-center shrink-0 mt-1">
                 <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} className="peer appearance-none w-6 h-6 border-2 border-brand-500 rounded bg-transparent checked:bg-brand-500 transition-colors" />
                 <Check className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
             </div>
             <span className="text-gray-300 text-sm leading-relaxed">
                Dichiaro che le informazioni fornite sono veritiere e autorizzo il trattamento dei dati personali ai fini della programmazione dell’attività di personal training da <strong>Davide Carfora</strong>.
             </span>
        </label>
      </div>

      <div className="mt-10 mb-4 flex justify-end">
        <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:w-auto bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-5 px-12 rounded-full text-lg flex justify-center items-center shadow-[0_0_30px_rgba(37,99,235,0.4)] transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
            {isSubmitting ? 'Invio in corso...' : 'INVIA QUESTIONARIO'}
            {!isSubmitting && <Check className="ml-2 w-6 h-6" />}
        </button>
      </div>
    </form>
  );
};

export default QuestionnaireForm;