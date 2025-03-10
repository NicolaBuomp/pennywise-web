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

/**
 * Thunk per il login utente con email e password
 */
export const login = (email: string, password: string) => async (dispatch: AppDispatch) => {
  dispatch(loginStart());
  try {
    const data = await authService.login(email, password);
    const userData = await authService.getCurrentUser();
    
    if (!data.isEmailVerified) {
      dispatch(addAlert({
        type: 'warning',
        message: 'Verifica la tua email per accedere a tutte le funzionalità.',
        autoHideDuration: 10000,
      }));
    }
    
    dispatch(loginSuccess({
      user: userData,
      isEmailVerified: data.isEmailVerified
    }));
    
    return {
      success: true,
      isEmailVerified: data.isEmailVerified,
      user: userData
    };
  } catch (error: any) {
    // Gestiamo l'errore di email non verificata senza interruzioni
    if (error.message && (
        error.message.includes('Email not confirmed') || 
        error.message.includes('email non confermata') ||
        error.message.includes('not verified') ||
        error.message.includes('non verificata') ||
        error.code === 'email_not_confirmed'
    )) {
      // Recuperiamo l'utente in ogni caso e lo settiamo come loggato
      try {
        const userData = await authService.getCurrentUser();
        dispatch(loginSuccess({
          user: userData,
          isEmailVerified: false
        }));
        
        dispatch(addAlert({
          type: 'warning',
          message: 'Email non verificata. Ti preghiamo di verificare la tua email.',
          autoHideDuration: 10000,
        }));
        
        return {
          success: true,
          isEmailVerified: false,
          user: userData
        };
      } catch (innerError) {
        dispatch(loginFailure('Impossibile completare il login: ' + (innerError as Error).message));
        throw innerError;
      }
    }
    
    dispatch(loginFailure((error as Error).message));
    throw error;
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
      user: userProfile || { id: '', email: email, username: userData.username || '' },
      isEmailVerified: data.isEmailVerified || false
    }));
    
    // Restituisci informazioni sulla registrazione e lo stato di verifica
    return {
      success: true,
      requiresEmailVerification: !data.isEmailVerified,
      email: email,
      user: userProfile
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
    await authService.sendEmailVerification(email);
    dispatch(addAlert({
      type: 'success',
      message: 'Email di verifica inviata. Controlla la tua casella di posta.',
      autoHideDuration: 6000,
    }));
    return true;
  } catch (error) {
    dispatch(addAlert({
      type: 'error',
      message: `Impossibile inviare l'email di verifica: ${(error as Error).message}`,
      autoHideDuration: 6000,
    }));
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
    const session = await authService.getSession();
    if (session) {
      const userData = await authService.getCurrentUser();
      dispatch(checkAuthSuccess(userData));
      
      // Verifica esplicita dello stato dell'email
      try {
        const isVerified = await authService.checkEmailVerification();
        console.log("Email verification status:", isVerified);
        dispatch(setEmailVerified(isVerified));
        
        // Se l'email non è verificata, mostra un alert
        if (!isVerified) {
          dispatch(addAlert({
            type: 'warning',
            message: 'Verifica il tuo indirizzo email per sbloccare tutte le funzionalità.',
            autoHideDuration: 10000,
          }));
        }
      } catch (verificationError) {
        console.error("Error checking email verification:", verificationError);
        // Se c'è un errore, assumiamo che l'email non sia verificata
        dispatch(setEmailVerified(false));
      }
    } else {
      dispatch(checkAuthFailure());
    }
  } catch (error) {
    console.error("Auth check error:", error);
    dispatch(checkAuthFailure());
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