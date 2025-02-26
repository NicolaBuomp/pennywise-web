// src/utils/authUtils.ts

/**
 * Estrae il token di conferma email da un URL
 * @param url URL del link di conferma
 * @returns Il token estratto o null se non trovato
 */
export const extractTokenFromUrl = (url: string): string | null => {
    try {
        const urlObj = new URL(url);

        // Cerca il token nei parametri della query
        const queryParams = new URLSearchParams(urlObj.search);
        const tokenFromQuery = queryParams.get('token') || queryParams.get('token_hash');

        if (tokenFromQuery) {
            return tokenFromQuery;
        }

        // Cerca il token nei parametri dell'hash
        if (urlObj.hash) {
            const hashParams = new URLSearchParams(urlObj.hash.substring(1));
            const tokenFromHash = hashParams.get('token') || hashParams.get('token_hash');

            if (tokenFromHash) {
                return tokenFromHash;
            }
        }

        // Se il token non è esplicitamente nel parametro 'token',
        // cerca di estrarlo dal percorso (alcuni provider lo inseriscono qui)
        const pathParts = urlObj.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart && lastPart.length > 20) {
            return lastPart;
        }

        return null;
    } catch (error) {
        console.error('Error extracting token from URL:', error);
        return null;
    }
};

/**
 * Salva informazioni di debug dell'autenticazione per la risoluzione dei problemi
 */
export const saveAuthDebugInfo = (data: Record<string, any>) => {
    const existingData = localStorage.getItem('auth_debug_info');

    try {
        const debugData = existingData ? JSON.parse(existingData) : [];

        // Aggiungi un timestamp alle informazioni di debug
        const debugEntry = {
            timestamp: new Date().toISOString(),
            ...data
        };

        // Mantieni solo le ultime 5 voci
        debugData.unshift(debugEntry);
        if (debugData.length > 5) {
            debugData.pop();
        }

        localStorage.setItem('auth_debug_info', JSON.stringify(debugData));
    } catch (error) {
        console.error('Error saving auth debug info:', error);
    }
};

/**
 * Recupera le informazioni di debug dell'autenticazione
 */
export const getAuthDebugInfo = () => {
    const debugData = localStorage.getItem('auth_debug_info');
    if (!debugData) return [];

    try {
        return JSON.parse(debugData);
    } catch (error) {
        console.error('Error parsing auth debug info:', error);
        return [];
    }
};

/**
 * Pulisce tutte le informazioni di debug dell'autenticazione
 */
export const clearAuthDebugInfo = () => {
    localStorage.removeItem('auth_debug_info');
    localStorage.removeItem('verification_token');
    localStorage.removeItem('verification_type');
    localStorage.removeItem('verification_error');
    localStorage.removeItem('last_auth_callback_url');
};