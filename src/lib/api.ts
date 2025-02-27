import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { supabase } from './supabase';

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
    async (config) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.access_token) {
                console.log('Token found:', session.access_token);
                config.headers.Authorization = `Bearer ${session.access_token}`;
            } else {
                console.warn('No active session found');
                return Promise.reject(new Error('No active session'));
            }

            return config;
        } catch (error) {
            console.error('Error in request interceptor:', error);
            return Promise.reject(error);
        }
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log delle risposte per debugging
        console.log(`API Response from ${response.config.url}: Status ${response.status}`);
        return response;
    },
    async (error: AxiosError) => {
        // Gestisci gli errori nella risposta
        if (error.response) {
            console.error(`API Error ${error.response.status} from ${error.config?.url}:`, error.response.data);

            // Errori del server (status code non 2xx)
            if (error.response.status === 401) {
                console.log('Attempting to refresh token due to 401 error');
                // Token scaduto o non valido, prova a ottenere una nuova sessione
                const { data } = await supabase.auth.refreshSession();

                // Se il refresh ha successo, riprova la richiesta originale
                if (data.session) {
                    console.log('Token refreshed successfully, retrying request');
                    // Ripristina la richiesta originale con il nuovo token
                    if (error.config) {
                        error.config.headers['Authorization'] = `Bearer ${data.session.access_token}`;
                        return api(error.config);
                    }
                } else {
                    console.warn('Token refresh failed, signout may be required');
                    // Se il refresh fallisce, reindirizza al login
                    // Puoi usare un evento personalizzato o un'azione Redux per gestire questo
                    window.dispatchEvent(new CustomEvent('auth:signout-required'));
                }
            }
        } else {
            console.error('API Error without response:', error.message);
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