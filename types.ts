export type QuestionType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';

export interface CustomQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // Used for select, radio, checkbox
}

export interface PinData {
  code: string;
  label: string;
  mustChange: boolean;
}

export interface QuestionnaireData {
  id: string;
  submissionDate: string;
  
  // 1. Dati Anagrafici
  fullName: string;
  dob: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  email: string;
  phone: string;
  profession: string;

  // 2. Stato di Salute
  heartProblems: boolean;
  pressure: 'Alta' | 'Bassa' | 'Normale';
  cardioDiseases: boolean;
  diabetes: 'No' | 'Tipo 1' | 'Tipo 2';
  respiratoryProblems: boolean;
  thyroidProblems: boolean;
  medications: string; // If yes, specify
  allergies: string;
  surgeries: boolean;

  // 3. Apparato Muscolo-Scheletrico
  currentPain: boolean;
  spineIssues: boolean;
  shoulderIssues: boolean;
  kneeIssues: boolean;
  hipIssues: boolean;
  ankleIssues: boolean;
  pastInjuries: string;
  painfulMovements: string;

  // 4. Livello Attività Fisica
  currentlyTraining: boolean;
  trainingSince: string;
  frequency: string;
  activityType: {
    weights: boolean;
    cardio: boolean;
    sports: boolean;
    other: string;
  };
  continuousActivityDuration: string;

  // 5. Esperienze Pregresse
  hashadTrainer: boolean;
  experienceFeedback: string;
  interruptedTraining: boolean;
  interruptionReason: string;

  // 6. Stile di Vita
  sleepHours: string;
  sleepQuality: 'Scarsa' | 'Media' | 'Buona';
  stressLevel: number; // 1-10
  jobActivity: 'Sedentario' | 'Attivo' | 'Molto fisico';
  smoker: boolean;
  alcohol: 'No' | 'Occasionalmente' | 'Regolarmente';

  // 7. Alimentazione
  followsDiet: boolean;
  foodIntolerances: string;
  mealsPerDay: string;
  drinksWater: boolean; // 1.5-2L
  dietQuality: 'Scarsa' | 'Discreta' | 'Buona';

  // 8. Obiettivi
  goals: {
    weightLoss: boolean;
    muscleGain: boolean;
    toning: boolean;
    strength: boolean;
    endurance: boolean;
    wellness: boolean;
    rehab: boolean;
    sportPerformance: boolean;
  };
  mainGoalDescription: string;

  // 9. Disponibilità
  weeklyAvailability: string;
  timePerSession: string;
  deadlineEvent: string;
  commitmentLevel: number; // 1-10

  // 10. Aspettative
  expectations: string;
  trainingPreference: 'Intensi' | 'Graduali' | 'Vari' | 'Tecnici';
  trainerStylePreference: 'Motivazione' | 'Controllo tecnico' | 'Educazione';

  // Extra: Domande Personalizzate (ID domanda -> Risposta (stringa o JSON string per array))
  customAnswers: Record<string, string>;

  // 11. Consenso & Foto
  consent: boolean;
  photos: string[]; // Base64 strings
}

export const initialQuestionnaire: QuestionnaireData = {
  id: '',
  submissionDate: '',
  fullName: '',
  dob: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
  email: '',
  phone: '',
  profession: '',
  heartProblems: false,
  pressure: 'Normale',
  cardioDiseases: false,
  diabetes: 'No',
  respiratoryProblems: false,
  thyroidProblems: false,
  medications: '',
  allergies: '',
  surgeries: false,
  currentPain: false,
  spineIssues: false,
  shoulderIssues: false,
  kneeIssues: false,
  hipIssues: false,
  ankleIssues: false,
  pastInjuries: '',
  painfulMovements: '',
  currentlyTraining: false,
  trainingSince: '',
  frequency: '',
  activityType: { weights: false, cardio: false, sports: false, other: '' },
  continuousActivityDuration: '',
  hashadTrainer: false,
  experienceFeedback: '',
  interruptedTraining: false,
  interruptionReason: '',
  sleepHours: '',
  sleepQuality: 'Media',
  stressLevel: 5,
  jobActivity: 'Sedentario',
  smoker: false,
  alcohol: 'No',
  followsDiet: false,
  foodIntolerances: '',
  mealsPerDay: '',
  drinksWater: false,
  dietQuality: 'Discreta',
  goals: {
    weightLoss: false,
    muscleGain: false,
    toning: false,
    strength: false,
    endurance: false,
    wellness: false,
    rehab: false,
    sportPerformance: false,
  },
  mainGoalDescription: '',
  weeklyAvailability: '',
  timePerSession: '',
  deadlineEvent: '',
  commitmentLevel: 8,
  expectations: '',
  trainingPreference: 'Vari',
  trainerStylePreference: 'Controllo tecnico',
  customAnswers: {},
  consent: false,
  photos: []
};