import { QuestionnaireData, CustomQuestion, User } from './types';

const STORAGE_KEY = 'davide_pt_submissions';
const AUTH_KEY = 'davide_pt_auth'; // Stores boolean 'true'
const USERS_KEY = 'davide_pt_users'; // Stores list of users
const QUESTIONS_KEY = 'davide_pt_custom_questions';

// --- DATA MANAGEMENT ---

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

// --- AUTHENTICATION & USERS ---

export const getUsers = (): User[] => {
    try {
        const u = localStorage.getItem(USERS_KEY);
        return u ? JSON.parse(u) : [];
    } catch {
        return [];
    }
};

export const saveUser = (username: string, pass: string) => {
    const users = getUsers();
    // Check if user exists
    if (users.find(u => u.username === username)) {
        throw new Error("Utente già esistente");
    }
    const newUser: User = { username, pass, role: 'admin' };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
};

export const deleteUser = (username: string) => {
    const users = getUsers();
    const updated = users.filter(u => u.username !== username);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
};

export const login = (u: string, p: string): boolean => {
    const users = getUsers();

    // BOOTSTRAP MODE: If no users exist, allow 1/1
    if (users.length === 0) {
        if (u === '1' && p === '1') {
            localStorage.setItem(AUTH_KEY, 'true');
            return true;
        }
        return false;
    }

    // NORMAL MODE
    const match = users.find(user => user.username === u && user.pass === p);
    if (match) {
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

// --- CUSTOM QUESTIONS ---

export const getCustomQuestions = (): CustomQuestion[] => {
    try {
        const q = localStorage.getItem(QUESTIONS_KEY);
        return q ? JSON.parse(q) : [];
    } catch {
        return [];
    }
};

export const saveCustomQuestion = (q: CustomQuestion) => {
    const current = getCustomQuestions();
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify([...current, q]));
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
        users: getUsers(),
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
                if (json.users) localStorage.setItem(USERS_KEY, JSON.stringify(json.users));
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