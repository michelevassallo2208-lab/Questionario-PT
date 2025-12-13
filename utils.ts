import { QuestionnaireData, CustomQuestion } from './types';

const STORAGE_KEY = 'davide_pt_submissions';
const AUTH_KEY = 'davide_pt_auth';
const CRED_KEY = 'davide_pt_creds';
const QUESTIONS_KEY = 'davide_pt_custom_questions';

const DEFAULT_CREDS = {
  user: 'davide',
  pass: 'DavideBTP'
};

export const getSubmissions = (): QuestionnaireData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading submissions", e);
    return [];
  }
};

export const saveSubmission = (data: QuestionnaireData) => {
  const current = getSubmissions();
  const updated = [data, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const clearSubmissions = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getCredentials = () => {
    try {
        const creds = localStorage.getItem(CRED_KEY);
        return creds ? JSON.parse(creds) : DEFAULT_CREDS;
    } catch {
        return DEFAULT_CREDS;
    }
};

export const login = (u: string, p: string): boolean => {
    const { user, pass } = getCredentials();
    if (u === user && p === pass) {
        localStorage.setItem(AUTH_KEY, 'true');
        return true;
    }
    return false;
};

export const logout = () => {
    localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = (): boolean => {
    return localStorage.getItem(AUTH_KEY) === 'true';
};

export const changePassword = (newPass: string) => {
    const creds = getCredentials();
    creds.pass = newPass;
    localStorage.setItem(CRED_KEY, JSON.stringify(creds));
};

// Custom Questions Logic
export const getCustomQuestions = (): CustomQuestion[] => {
    try {
        const q = localStorage.getItem(QUESTIONS_KEY);
        return q ? JSON.parse(q) : [];
    } catch {
        return [];
    }
};

export const saveCustomQuestion = (text: string) => {
    const current = getCustomQuestions();
    const newQ: CustomQuestion = { id: crypto.randomUUID(), text };
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify([...current, newQ]));
};

export const deleteCustomQuestion = (id: string) => {
    const current = getCustomQuestions();
    const updated = current.filter(q => q.id !== id);
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(updated));
};

// --- BACKUP & SECURITY ---

export const exportDatabase = () => {
    const db = {
        submissions: getSubmissions(),
        questions: getCustomQuestions(),
        creds: getCredentials(), // Optional: include creds or keep them separate
        timestamp: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `DavidePT_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};

export const importDatabase = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (json.submissions) localStorage.setItem(STORAGE_KEY, JSON.stringify(json.submissions));
                if (json.questions) localStorage.setItem(QUESTIONS_KEY, JSON.stringify(json.questions));
                // We typically don't overwrite credentials blindly unless requested, but here we assume full restore
                // if (json.creds) localStorage.setItem(CRED_KEY, JSON.stringify(json.creds)); 
                resolve(true);
            } catch (e) {
                console.error("Invalid backup file", e);
                resolve(false);
            }
        };
        reader.onerror = () => resolve(false);
        reader.readAsText(file);
    });
};