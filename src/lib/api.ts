import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import {supabase} from './supabase';

// Interfacce per la tipizzazione
interface ApiErrorResponse {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}

interface RefreshResult {
    success: boolean;
    token: string | null;
}

// ✅ Costanti e configurazione
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const ENV = import.meta.env.MODE || 'development';
const IS_DEV = ENV === 'development';

// ✅ Creazione dell'istanza di Axios con configurazione di base
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Timeout per le richieste (30 secondi)
    timeout: 30000,
});

// Variabile per tenere traccia delle richieste in corso di refresh token
let isRefreshing = false;
let refreshPromise: Promise<RefreshResult> | null = null;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
}> = [];

// Processa la coda delle richieste fallite
const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else if (token) {
            promise.resolve(token);
        }
    });

    failedQueue = [];
};

// ✅ Funzione per gestire il refresh del token silenziosamente
async function refreshTokenSilently(): Promise<RefreshResult> {
    try {
        if (IS_DEV) console.log('🔄 Tentativo di refresh del token...');

        const {data, error} = await supabase.auth.refreshSession();

        if (error) throw error;

        if (data.session) {
            if (IS_DEV) console.log('🔄 Token aggiornato con successo');
            return {
                success: true,
                token: data.session.access_token
            };
        } else {
            if (IS_DEV) console.warn('⚠️ Refresh fallito: nessuna sessione restituita');
            return {success: false, token: null};
        }
    } catch (error) {
        if (IS_DEV) console.error('❌ Errore durante il refresh del token:', error);
        return {success: false, token: null};
    } finally {
        isRefreshing = false;
        refreshPromise = null;
    }
}

// ✅ Sistema di notifica degli errori (sostituisce gli alert)
// Questo è un esempio, puoi integrarlo con il tuo sistema di notifiche
const notificationService = {
    error: (message: string) => {
        if (typeof window !== 'undefined') {
            // Emetti un evento personalizzato che può essere intercettato per mostrare notifiche
            window.dispatchEvent(new CustomEvent('api:error', {detail: {message}}));

            // Log solo in sviluppo
            if (IS_DEV) console.error('🔔 API Error:', message);
        }
    },
    success: (message: string) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('api:success', {detail: {message}}));

            if (IS_DEV) console.log('🔔 API Success:', message);
        }
    }
};

// ✅ Interceptor per le richieste (aggiunge il token)
api.interceptors.request.use(
    async (config) => {
        try {
            const {data: {session}} = await supabase.auth.getSession();

            if (session?.access_token) {
                if (IS_DEV) console.log('🔐 Token trovato:', session.access_token.substring(0, 10) + '...');
                config.headers.Authorization = `Bearer ${session.access_token}`;
            } else {
                if (IS_DEV) console.warn('⚠️ Nessuna sessione attiva trovata');
                throw new Error('No active session');
            }

            return config;
        } catch (error) {
            if (IS_DEV) console.error(`❌ Errore nell'interceptor della richiesta:`, error);
            return Promise.reject(error);
        }
    },
    (error) => {
        if (IS_DEV) console.error(`❌ Errore nell'interceptor della richiesta:`, error);
        return Promise.reject(error);
    }
);

// ✅ Interceptor per le risposte (gestisce errori e refresh token)
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log solo in ambiente di sviluppo
        if (IS_DEV) {
            console.log(
                `✅ API Response: [${response.config.method?.toUpperCase()}] ${response.config.url} - Status ${response.status}`
            );
        }

        // Restituisci direttamente i dati per semplificare l'uso
        return response.data;
    },
    async (error: AxiosError<ApiErrorResponse>) => {
        // Log dettagliato solo in ambiente di sviluppo
        if (IS_DEV) {
            console.error(
                `❌ API Error: ${error.response?.status} - ${error.config?.url}`,
                error.response?.data || error.message
            );
        }

        // Ottieni la configurazione originale per poter riprovare la richiesta
        const originalConfig = error.config;

        if (!originalConfig) {
            return Promise.reject(error);
        }

        // Gestione specifica per errori di autenticazione (401)
        if (error.response?.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true;

            // Se il refresh è già in corso, accoda questa richiesta
            if (isRefreshing) {
                try {
                    // Attendi il token dall'operazione di refresh in corso
                    const token = await new Promise<string>((resolve, reject) => {
                        failedQueue.push({resolve, reject});
                    });

                    originalConfig.headers.Authorization = `Bearer ${token}`;
                    return axios(originalConfig);
                } catch (refreshError) {
                    // Se il refresh fallisce, gestisci il fallimento
                    notificationService.error('Sessione scaduta. Effettua nuovamente il login.');
                    window.dispatchEvent(new CustomEvent('auth:signout-required'));
                    return Promise.reject(refreshError);
                }
            }

            // Avvia il processo di refresh
            isRefreshing = true;
            refreshPromise = refreshTokenSilently();

            try {
                const result = await refreshPromise;

                if (result.success && result.token) {
                    // Aggiorna l'header con il nuovo token
                    originalConfig.headers.Authorization = `Bearer ${result.token}`;

                    // Processa la coda delle richieste fallite
                    processQueue(null, result.token);

                    // Riprova la richiesta originale
                    return axios(originalConfig);
                } else {
                    // Se il refresh fallisce, gestisci il fallimento
                    const refreshError = new Error('Sessione scaduta. Effettua nuovamente il login.');
                    processQueue(refreshError);

                    notificationService.error(refreshError.message);
                    window.dispatchEvent(new CustomEvent('auth:signout-required'));

                    return Promise.reject(refreshError);
                }
            } catch (refreshError) {
                // Se si verifica un errore durante il refresh
                const errorObj = refreshError instanceof Error ? refreshError : new Error('Errore durante il refresh del token');
                processQueue(errorObj);

                notificationService.error(errorObj.message);
                window.dispatchEvent(new CustomEvent('auth:signout-required'));

                return Promise.reject(errorObj);
            }
        }

        // Gestisci altri errori (non 401)
        if (error.response) {
            // Estrai il messaggio di errore per la notifica
            const errorMessage = error.response.data?.message ||
                `Errore ${error.response.status}: Si è verificato un problema.`;

            // Usa il sistema di notifiche invece di alert
            notificationService.error(errorMessage);

            // Errori specifici per problema di rete
            if (error.response.status >= 500) {
                notificationService.error('Si è verificato un problema con il server. Riprova più tardi.');
            }

            // Ritorna l'errore in modo strutturato per una gestione più facile
            return Promise.reject({
                status: error.response.status,
                data: error.response.data,
                message: errorMessage
            });
        } else if (error.request) {
            // Errore di rete: la richiesta è stata inviata ma non si è ricevuta risposta
            const networkErrorMsg = 'Impossibile contattare il server. Verifica la tua connessione.';
            notificationService.error(networkErrorMsg);

            return Promise.reject({
                status: 0,
                message: networkErrorMsg
            });
        } else {
            // Errore durante la configurazione della richiesta
            const configErrorMsg = 'Errore durante la configurazione della richiesta.';
            notificationService.error(configErrorMsg);

            return Promise.reject({
                status: 0,
                message: configErrorMsg
            });
        }
    }
);

// ✅ Funzioni di utilità per le chiamate API con tipizzazione migliorata
const apiService = {
    get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        api.get<any, T>(url, config),

    post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
        api.post<any, T>(url, data, config),

    put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
        api.put<any, T>(url, data, config),

    patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
        api.patch<any, T>(url, data, config),

    delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        api.delete<any, T>(url, config),
};

export default apiService;