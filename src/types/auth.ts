// Definizione dei tipi per l'autenticazione
export interface AuthUser {
    id: string;
    email?: string;
    email_confirmed_at?: string | null;
    phone?: string;
    created_at?: string;
    updated_at?: string;
    user_metadata?: {
        first_name?: string;
        last_name?: string;
        phone?: string;
        avatar_url?: string;
        [key: string]: any;
    };
    app_metadata?: {
        provider?: string;
        [key: string]: any;
    };
    [key: string]: any;
}

export interface Session {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    user: AuthUser;
}

export interface AuthState {
    user: AuthUser | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
}