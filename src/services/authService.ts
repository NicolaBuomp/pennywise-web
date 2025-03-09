import { User } from '../redux/slices/authSlice';
import supabase from '../supabaseClient';

// Interfaccia per i dati aggiuntivi dell'utente durante la registrazione
export interface UserData {
  username?: string;
  displayName?: string;
  defaultCurrency?: string;
  language?: string;
}

/**
 * Servizio per la gestione dell'autenticazione con Supabase
 */
export const authService = {
  /**
   * Effettua il login con email e password
   * @param email - Email dell'utente
   * @param password - Password dell'utente
   * @returns Dati dell'utente autenticato e stato di verifica email
   */
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    // Verifica lo stato di verifica dell'email
    const isEmailVerified = data.user?.email_confirmed_at !== null;
    
    // Se l'email non è verificata, invia un promemoria per verificarla
    if (!isEmailVerified) {
      await authService.sendEmailVerification();
    }
    
    return { ...data, isEmailVerified };
  },

  /**
   * Invia un'email di verifica all'utente corrente
   */
  sendEmailVerification: async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: (await supabase.auth.getUser()).data.user?.email,
    });

    if (error) throw error;
  },

  /**
   * Effettua il login con provider OAuth (Google, Apple)
   * @param provider - Provider OAuth ('google' o 'apple')
   * @returns Dati della sessione OAuth
   */
  loginWithProvider: async (provider: 'google' | 'apple') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Registra un nuovo utente
   * @param email - Email dell'utente
   * @param password - Password dell'utente
   * @param userData - Dati aggiuntivi per il profilo
   * @returns Dati dell'utente registrato
   */
  register: async (email: string, password: string, userData: UserData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: userData.username || email.split('@')[0],
          display_name: userData.displayName || userData.username || email.split('@')[0],
          default_currency: userData.defaultCurrency || 'EUR',
          language: userData.language || 'it',
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm-email`,
      },
    });

    if (error) throw error;
    
    // La maggior parte dei provider Supabase richiede verifica email
    // meta.data?.email_confirmed_at sarà null se la verifica è necessaria
    const isEmailVerified = data.user?.email_confirmed_at !== null;
    
    return { ...data, isEmailVerified };
  },

  /**
   * Verifica lo stato di conferma dell'email dell'utente corrente
   * @returns Stato di verifica dell'email
   */
  checkEmailVerification: async () => {
    const { data: userData } = await supabase.auth.getUser();
    return userData.user?.email_confirmed_at !== null;
  },

  /**
   * Effettua il logout dell'utente
   */
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Recupera la sessione corrente
   * @returns Sessione utente o null
   */
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Recupera l'utente corrente
   * @returns Dati utente o null
   */
  getCurrentUser: async () => {
    const { data } = await supabase.auth.getUser();
    
    if (!data.user) return null;
    
    // Recupera i dati completi dell'utente dal db
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (error) throw error;
    
    return userData as User;
  },

  /**
   * Invia email per reset password
   * @param email - Email dell'utente
   */
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Aggiorna la password utente
   * @param newPassword - Nuova password
   */
  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Aggiorna il profilo utente
   * @param userData - Dati da aggiornare
   */
  updateUserProfile: async (userData: Partial<User>) => {
    // Aggiorna i metadati dell'utente in auth
    const { data: authData, error: authError } = await supabase.auth.updateUser({
      data: {
        display_name: userData.display_name,
        username: userData.username,
        default_currency: userData.default_currency,
        language: userData.language,
      }
    });

    if (authError) throw authError;

    // Aggiorna i dati nella tabella users
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .update({
        display_name: userData.display_name,
        username: userData.username,
        default_currency: userData.default_currency,
        language: userData.language,
        avatar_url: userData.avatar_url,
      })
      .eq('id', authData.user.id)
      .select()
      .single();

    if (profileError) throw profileError;
    
    return profileData as User;
  },
};

export default authService;