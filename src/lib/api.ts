import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { supabase } from './supabase';

// Ottieni l'URL base dall'ambiente
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Crea un'istanza di axios con la configurazione di base
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor per le richieste
api.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
        // Ottieni la sessione corrente da Supabase
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        // Se esiste un token, aggiungilo all'header di autorizzazione
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        // Gestisci gli errori nella richiesta
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Puoi elaborare la risposta qui se necessario
        return response;
    },
    async (error: AxiosError) => {
        // Gestisci gli errori nella risposta
        if (error.response) {
            // Errori del server (status code non 2xx)
            if (error.response.status === 401) {
                // Token scaduto o non valido, prova a ottenere una nuova sessione
                const { data } = await supabase.auth.refreshSession();

                // Se il refresh ha successo, riprova la richiesta originale
                if (data.session) {
                    // Ripristina la richiesta originale con il nuovo token
                    if (error.config) {
                        error.config.headers['Authorization'] = `Bearer ${data.session.access_token}`;
                        return api(error.config);
                    }
                } else {
                    // Se il refresh fallisce, reindirizza al login
                    // Puoi usare un evento personalizzato o un'azione Redux per gestire questo
                    window.dispatchEvent(new CustomEvent('auth:signout-required'));
                }
            }
        }

        return Promise.reject(error);
    }
);

// Funzioni di utilità per le chiamate API
const apiService = {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        api.get<T>(url, config).then(response => response.data),

    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        api.post<T>(url, data, config).then(response => response.data),

    put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        api.put<T>(url, data, config).then(response => response.data),

    patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        api.patch<T>(url, data, config).then(response => response.data),

    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        api.delete<T>(url, config).then(response => response.data),
};

export default apiService;