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
        message: 'Verifica la tua email per accedere a tutte le funzionalità. Ti abbiamo inviato un nuovo link di verifica.',
        autoHideDuration: 10000,
      }));
    }
    
    dispatch(loginSuccess({
      user: userData as User,
      isEmailVerified: data.isEmailVerified
    }));
    
    return userData;
  } catch (error) {
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
    const userProfile = await authService.getCurrentUser();
    
    if (!data.isEmailVerified) {
      dispatch(addAlert({
        type: 'info',
        message: 'Ti abbiamo inviato un\'email di verifica. Per favore controlla la tua casella di posta e conferma il tuo indirizzo email.',
        autoHideDuration: 10000,
      }));
    }
    
    dispatch(registerSuccess({
      user: userProfile as User,
      isEmailVerified: data.isEmailVerified
    }));
    
    return userProfile;
  } catch (error) {
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
export const sendEmailVerification = () => async (dispatch: AppDispatch) => {
  try {
    await authService.sendEmailVerification();
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
      
      // Dopo aver verificato l'autenticazione, controlla lo stato dell'email
      dispatch(checkEmailVerification());
    } else {
      dispatch(checkAuthFailure());
    }
  } catch (error) {
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