import { User } from '../redux/slices/authSlice';
import supabase from '../supabaseClient';

// Interfaccia per i dati aggiuntivi dell'utente durante la registrazione
export interface UserData {
  username?: string;
  displayName?: string;
  phoneNumber?: string | null;
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
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Rimuoviamo il blocco email non verificata per consentire l'accesso comunque
      throw error;
    }
    
    // Determina lo stato di verifica dell'email
    const isEmailVerified = data.user?.email_confirmed_at !== null;
    
    return { ...data, isEmailVerified };
  } catch (error) {
    // Propaga l'errore per gestirlo nel thunk
    throw error;
  }
},

/**
 * Invia un'email di verifica all'utente
 * @param email - Email dell'utente (opzionale, usa l'utente corrente se non specificato)
 */
sendEmailVerification: async (email?: string) => {
  try {
    let result;
    
    if (email) {
      // Invia email a un indirizzo specifico
      result = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          // URL assoluto corretto
          emailRedirectTo: `${window.location.origin}/auth/confirm-email`
        }
      });
    } else {
      // Usa l'utente corrente se disponibile
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Nessun utente attualmente autenticato');
      }
      
      result = await supabase.auth.resend({
        type: 'signup',
        email: sessionData.session.user.email || '',
        options: {
          // URL assoluto corretto
          emailRedirectTo: `${window.location.origin}/auth/confirm-email`
        }
      });
    }
    
    if (result.error) throw result.error;
    return result.data;
  } catch (error) {
    throw error;
  }
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
          phone_number: userData.phoneNumber || null,
          default_currency: userData.defaultCurrency || 'EUR',
          language: userData.language || 'it',
        },
        // Fix per il redirectTo - assicuriamoci che sia un URL assoluto corretto
        emailRedirectTo: `${window.location.origin}/auth/confirm-email`,
      },
    });
  
    if (error) throw error;
    
    // La maggior parte dei provider Supabase richiede verifica email
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
    console.log("authService.getCurrentUser -> getUser:", data.user); // log per debug
    if (!data.user) return null;
    
    // Recupera i dati completi dell'utente dal db
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    console.log("authService.getCurrentUser -> DB userData:", userData); // log per debug
      
    if (error) {
      console.error("Error fetching user data from DB:", error);
      throw error;
    }
    
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
        phone_number: userData.phone_number,
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
        phone_number: userData.phone_number,
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