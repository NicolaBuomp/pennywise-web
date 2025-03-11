import { AppDispatch } from '../store';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logoutStart,
  logoutSuccess,
  logoutFailure,
  checkAuthStart,
  checkAuthSuccess,
  checkAuthFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  setEmailVerified,
  User
} from '../slices/authSlice';
import authService, { UserData } from '../../services/authService';
import { addAlert } from '../slices/uiSlice';
import supabase from '@/supabaseClient';

// Tracciamo l'ultimo invio dell'email per gestire il rate limit a livello globale
let lastEmailVerificationSent = 0;

/**
 * Thunk per il login utente con email e password
 */
export const login = (email: string, password: string) => async (dispatch: AppDispatch) => {
  dispatch(loginStart());
  try {
    // Utilizziamo il service che ora gestisce anche il caso di email non verificata
    const result = await authService.login(email, password);
    
    if (result.needsEmailVerification) {
      // Se siamo qui, l'utente ha credenziali valide ma l'email non è verificata
      // Invece di bloccare il login, mostriamo un avviso e consentiamo l'accesso limitato
      
      // Poiché non abbiamo una sessione valida, dobbiamo creare dati utente temporanei
      const tempUser: User = {
        id: '',
        email: email,
        username: email.split('@')[0],
        // altri campi possono rimanere undefined
      };
      
      dispatch(loginSuccess({ user: tempUser, isEmailVerified: false }));
      
      dispatch(addAlert({
        type: 'warning',
        message: 'Email non verificata. Verifica la tua email entro 48 ore dalla registrazione per evitare limitazioni.',
        autoHideDuration: 10000,
      }));
      
      // Inviamo automaticamente una nuova email di verifica
      await dispatch(sendEmailVerification(email));
      
      return {
        success: true,
        isEmailVerified: false,
        user: tempUser,
        needsEmailVerification: true
      };
    }

    // Caso normale: login riuscito e abbiamo i dati utente
    const userData = await authService.getCurrentUser();
    const isEmailVerified = !!result.user?.email_confirmed_at;
    
    // Avviso se l'email non è verificata
    if (!isEmailVerified) {
      dispatch(addAlert({
        type: 'warning',
        message: 'Verifica la tua email entro 48 ore dalla registrazione per evitare limitazioni.',
        autoHideDuration: 10000,
      }));
    }
    
    dispatch(loginSuccess({ user: userData, isEmailVerified }));
    return {
      success: true,
      isEmailVerified,
      user: userData
    };
  } catch (error: any) {
    dispatch(loginFailure((error as Error).message));
    return {
      success: false,
      errorType: 'login_error',
      message: (error as Error).message
    };
  }
};

/**
 * Thunk per il login con provider OAuth (Google, Apple)
 */
export const loginWithProvider = (provider: 'google' | 'apple') => async (dispatch: AppDispatch) => {
  dispatch(loginStart());
  try {
    const data = await authService.loginWithProvider(provider);
    // Nota: per il login OAuth, potrebbe non essere necessario chiamare loginSuccess subito
    // in quanto il flusso OAuth reindirizza l'utente e successivamente bisognerà verificare lo stato di autenticazione
    return data;
  } catch (error) {
    dispatch(loginFailure((error as Error).message));
    throw error;
  }
};

/**
 * Thunk per la registrazione di un nuovo utente
 */
export const register = (email: string, password: string, userData: UserData) => async (dispatch: AppDispatch) => {
  dispatch(registerStart());
  try {
    const data = await authService.register(email, password, userData);
    
    // Nella maggior parte dei casi, dopo la registrazione l'utente non è ancora verificato
    // ma è autenticato, quindi recuperiamo i suoi dati
    let userProfile;
    try {
      userProfile = await authService.getCurrentUser();
    } catch (error) {
      console.error("Couldn't fetch user profile after registration:", error);
      userProfile = null;
    }
    
    // Imposta lo stato di autenticazione in Redux
    dispatch(registerSuccess({
      user: userProfile || { 
        id: data.user?.id || '',
        email: email, 
        username: userData.username || email.split('@')[0] 
      },
      isEmailVerified: data.isEmailVerified || false
    }));
    
    // Restituisci informazioni sulla registrazione e lo stato di verifica
    return {
      success: true,
      requiresEmailVerification: !data.isEmailVerified,
      email: email,
      user: userProfile || data.user
    };
  } catch (error: any) {
    dispatch(registerFailure((error as Error).message));
    throw error;
  }
};

/**
 * Thunk per verificare lo stato di verifica dell'email
 */
export const checkEmailVerification = () => async (dispatch: AppDispatch) => {
  try {
    const isVerified = await authService.checkEmailVerification();
    dispatch(setEmailVerified(isVerified));
    return isVerified;
  } catch (error) {
    // Non gestiamo l'errore qui, semplicemente restituiamo false
    dispatch(setEmailVerified(false));
    return false;
  }
};

/**
 * Thunk per inviare una nuova email di verifica
 */
export const sendEmailVerification = (email?: string) => async (dispatch: AppDispatch) => {
  try {
    // Controllo rate limit semplificato (60 secondi)
    const now = Date.now();
    const timeSinceLastEmail = now - lastEmailVerificationSent;
    
    if (timeSinceLastEmail < 60000) { // 60 secondi in millisecondi
      const remainingSeconds = Math.ceil((60000 - timeSinceLastEmail) / 1000);
      
      dispatch(addAlert({
        type: 'warning',
        message: `Per motivi di sicurezza, attendi ${remainingSeconds} secondi prima di inviare un'altra email.`,
        autoHideDuration: 6000,
      }));
      
      return false;
    }
    
    await authService.sendEmailVerification(email);
    lastEmailVerificationSent = now;
    
    dispatch(addAlert({
      type: 'success',
      message: 'Email di verifica inviata. Controlla la tua casella di posta.',
      autoHideDuration: 6000,
    }));
    return true;
  } catch (error: any) {
    if (error.code === 'over_email_send_rate_limit') {
      dispatch(addAlert({
        type: 'warning',
        message: "Per motivi di sicurezza, devi attendere prima di inviare un'altra email di verifica.",
        autoHideDuration: 10000,
      }));
    } else {
      dispatch(addAlert({
        type: 'error',
        message: `Impossibile inviare l'email di verifica: ${(error as Error).message}`,
        autoHideDuration: 6000,
      }));
    }
    return false;
  }
};

/**
 * Thunk per il logout utente
 */
export const logout = () => async (dispatch: AppDispatch) => {
  dispatch(logoutStart());
  try {
    await authService.logout();
    dispatch(logoutSuccess());
  } catch (error) {
    dispatch(logoutFailure((error as Error).message));
    throw error;
  }
};

/**
 * Thunk per verificare lo stato di autenticazione corrente
 */
export const checkAuthState = () => async (dispatch: AppDispatch) => {
  dispatch(checkAuthStart());
  try {
    // Prima ottieni la sessione
    const { data: sessionData } = await supabase.auth.getSession();
    console.log("checkAuthState -> session data:", sessionData); // log per debug
    const session = sessionData.session;

    if (session) {
      // La sessione esiste, ottieni i dati utente dal db Supabase
      const userData = await authService.getCurrentUser();
      
      // Verifica esplicita dello stato dell'email
      const isVerified = !!session.user.email_confirmed_at;
      console.log("checkAuthState -> email verification status:", isVerified); // log per debug
      
      dispatch(checkAuthSuccess(userData));
      dispatch(setEmailVerified(isVerified));
      
      if (!isVerified) {
        dispatch(addAlert({
          type: 'warning',
          message: 'Verifica il tuo indirizzo email per accedere all\'applicazione.',
          autoHideDuration: 10000,
        }));
      }
      
      return {
        success: true,
        isAuthenticated: true,
        isEmailVerified: isVerified,
        user: userData
      };
    } else {
      dispatch(checkAuthFailure());
      return {
        success: false,
        isAuthenticated: false,
        isEmailVerified: false
      };
    }
  } catch (error) {
    console.error("Auth check error:", error); // log per debug
    dispatch(checkAuthFailure());
    return {
      success: false,
      isAuthenticated: false,
      isEmailVerified: false,
      error
    };
  }
};

/**
 * Thunk per recuperare la password
 */
export const resetPassword = (email: string) => async () => {
  try {
    return await authService.resetPassword(email);
  } catch (error) {
    throw error;
  }
};

/**
 * Thunk per aggiornare la password utente
 */
export const updatePassword = (newPassword: string) => async () => {
  try {
    await authService.updatePassword(newPassword);
    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Thunk per aggiornare il profilo utente
 */
export const updateProfile = (userData: Partial<User>) => async (dispatch: AppDispatch) => {
  dispatch(updateProfileStart());
  try {
    const updatedUser = await authService.updateUserProfile(userData);
    dispatch(updateProfileSuccess(updatedUser));
    return updatedUser;
  } catch (error) {
    dispatch(updateProfileFailure((error as Error).message));
    throw error;
  }
};