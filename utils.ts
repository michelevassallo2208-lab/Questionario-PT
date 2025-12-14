import { QuestionnaireData, CustomQuestion, PinData } from './types';

// CONFIGURAZIONE API VERCEL
// Su Vercel le API sono servite automaticamente sotto /api
const API_BASE_URL = '/api'; 

const AUTH_KEY = 'davide_pt_auth_token';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
    try {
        // Rimuoviamo lo slash iniziale dall'endpoint se presente per unirlo correttamente
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        
        const response = await fetch(`${API_BASE_URL}/${cleanEndpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        });
        
        // Gestione errori HTTP
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }
        
        // Se la risposta è vuota (es. dopo una DELETE), non fare parse JSON
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    } catch (error) {
        console.error(`Errore chiamata ${endpoint}:`, error);
        throw error;
    }
}

// --- GESTIONE QUESTIONARI ---

export const getSubmissions = async (): Promise<QuestionnaireData[]> => {
    try {
        const data = await apiFetch('submissions'); 
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Errore recupero schede", e);
        return [];
    }
};

export const saveSubmission = async (data: QuestionnaireData): Promise<boolean> => {
    try {
        await apiFetch('submissions', { 
            method: 'POST',
            body: JSON.stringify(data)
        });
        return true;
    } catch (e) {
        console.error("Errore salvataggio scheda", e);
        alert("Errore di connessione al server.");
        return false;
    }
};

export const deleteSubmission = async (id: string): Promise<boolean> => {
    try {
         await apiFetch(`submissions?id=${id}`, { method: 'DELETE' }); 
         return true;
    } catch (e) {
        alert("Errore eliminazione.");
        return false;
    }
};

// --- AUTENTICAZIONE & PIN ---

export const getPins = async (): Promise<PinData[]> => {
    try {
        return await apiFetch('pins'); 
    } catch {
        return []; 
    }
};

export const verifyPin = async (inputPin: string): Promise<{ valid: boolean; mustChange: boolean }> => {
    try {
        const result = await apiFetch('login', { 
            method: 'POST',
            body: JSON.stringify({ pin: inputPin })
        });

        if (result.valid) {
            if (!result.mustChange) {
                localStorage.setItem(AUTH_KEY, 'true');
            }
            return { valid: true, mustChange: result.mustChange };
        }
        return { valid: false, mustChange: false };
    } catch (e) {
        console.error("Errore login", e);
        return { valid: false, mustChange: false };
    }
};

export const updatePin = async (oldCode: string, newCode: string) => {
    await apiFetch('pins', { 
        method: 'PUT',
        body: JSON.stringify({ oldCode, newCode })
    });
    localStorage.setItem(AUTH_KEY, 'true');
};

export const addPin = async (code: string, label: string) => {
    await apiFetch('pins', { 
        method: 'POST',
        body: JSON.stringify({ code, label })
    });
};

export const deletePin = async (code: string) => {
    await apiFetch(`pins?code=${code}`, { method: 'DELETE' });
};

export const logout = () => {
    localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = (): boolean => {
    return localStorage.getItem(AUTH_KEY) === 'true';
};

// --- DOMANDE PERSONALIZZATE ---

export const getCustomQuestions = async (): Promise<CustomQuestion[]> => {
    try {
        return await apiFetch('questions');
    } catch {
        return [];
    }
};

export const saveCustomQuestion = async (q: CustomQuestion) => {
    await apiFetch('questions', { 
        method: 'POST',
        body: JSON.stringify(q)
    });
};

export const deleteCustomQuestion = async (id: string) => {
    await apiFetch(`questions?id=${id}`, { method: 'DELETE' });
};