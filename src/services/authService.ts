import { User } from '../redux/slices/authSlice';
import supabase from '../supabaseClient';

// Interfaccia per i dati aggiuntivi dell'utente durante la registrazione
export interface UserData {
  firstName?: string;
  lastName?: string;
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
        // Se l'errore è dovuto all'email non verificata, dobbiamo gestirlo in modo speciale
        if (error.message === 'Email not confirmed' || error.code === 'email_not_confirmed') {
          // Prima otteniamo l'utente attraverso l'autenticazione con la password
          // In questo caso specifico, ignoriamo l'errore di email non verificata
          console.log("Email non verificata, tentativo di login comunque...");
          
          // Utilizziamo un metodo alternativo per ottenere l'utente
          // Prima verifichiamo le credenziali senza applicare la restrizione di email verificata
          const { data: userData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: {
              // Tentativo di bypassare la verifica dell'email (potrebbe non funzionare su tutte le istanze Supabase)
              // emailRedirectTo: `${window.location.origin}/auth/confirm-email`
            }
          });
          
          // Se le credenziali sono corrette ma l'email non è verificata
          if (signInError && (signInError.message === 'Email not confirmed' || signInError.code === 'email_not_confirmed')) {
            // Restituiamo comunque i dati dell'utente con flag isEmailVerified impostato a false
            return { 
              user: { email, id: '' },  // Dati utente parziali
              session: null,
              isEmailVerified: false,
              needsEmailVerification: true
            };
          } else {
            // Se c'è un altro errore, lo rilanciamo
            throw signInError || new Error('Credenziali non valide');
          }
        }
        
        // Per qualsiasi altro errore, lo propaga
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
   * @returns Promise con il risultato dell'invio dell'email
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
    // Prima registrazione con auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          phone_number: userData.phoneNumber || null,
          default_currency: userData.defaultCurrency || 'EUR',
          language: userData.language || 'it',
        },
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
    
    const { data: userData, error } = await supabase
      .from('profiles')
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

    // Aggiorna i dati nella tabella 'profiles'
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
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

  /**
   * Sincronizza manualmente l'utente dalla tabella auth.users a public.users
   * @param userId - ID dell'utente da sincronizzare
   */
  syncUserToDatabase: async (userId?: string) => {
    try {
      // Se non viene fornito l'ID, usa l'utente corrente
      if (!userId) {
        const { data } = await supabase.auth.getUser();
        if (!data.user) return null;
        userId = data.user.id;
      }

      // Per gli ambienti senza accesso a admin.getUserById, usa i dati utente correnti
      let authUser;
      try {
        // Prima prova con l'API admin se disponibile
        const { data, error } = await supabase.auth.admin.getUserById(userId);
        if (error) throw error;
        authUser = data;
      } catch (error) {
        console.log("Admin API not available, falling back to current user data");
        // Fallback se admin API non è disponibile
        const { data } = await supabase.auth.getUser();
        if (!data.user || data.user.id !== userId) {
          throw new Error("Cannot sync user: current user doesn't match requested ID");
        }
        authUser = { user: data.user };
      }
      
      // Inserisci o aggiorna l'utente nella tabella users
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .upsert({
          id: authUser.user.id,
          email: authUser.user.email,
          username: authUser.user.user_metadata?.username || authUser.user.email?.split('@')[0],
          display_name: authUser.user.user_metadata?.display_name || authUser.user.user_metadata?.username || authUser.user.email?.split('@')[0],
          phone_number: authUser.user.user_metadata?.phone_number || null,
          default_currency: authUser.user.user_metadata?.default_currency || 'EUR',
          language: authUser.user.user_metadata?.language || 'it',
        }, { onConflict: 'id' })
        .select()
        .single();
      
      if (dbError) {
        console.error("Error syncing user to database:", dbError);
        return null;
      }
      
      return dbUser;
    } catch (error) {
      console.error("Error in syncUserToDatabase:", error);
      return null;
    }
  },
};

export default authService;
