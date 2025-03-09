import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Alert, 
  AlertTitle, 
  Button, 
  Collapse, 
  IconButton,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { RootState, AppDispatch } from '../../redux/store';
import { sendEmailVerification } from '../../redux/thunks/authThunks';

interface EmailVerificationBannerProps {
  /**
   * Determina quando mostrare il banner
   * 'always': sempre visibile se l'email non è verificata
   * 'once-per-session': visibile una volta per sessione
   * 'once': visibile una volta e poi nascosto permanentemente (salvato in localStorage)
   */
  displayMode?: 'always' | 'once-per-session' | 'once';
}

/**
 * Banner che avvisa l'utente quando la sua email non è stata verificata
 * e offre la possibilità di inviare nuovamente l'email di verifica
 */
const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ 
  displayMode = 'always' 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isEmailVerified, user } = useSelector((state: RootState) => state.auth);
  
  const [open, setOpen] = useState<boolean>(true);
  const [isResending, setIsResending] = useState<boolean>(false);

  // Se l'email è verificata, non mostrare il banner
  if (isEmailVerified) {
    return null;
  }

  // Controllo per displayMode 'once'
  if (displayMode === 'once' && localStorage.getItem('emailVerificationBannerDismissed') === 'true') {
    return null;
  }

  // Controllo per displayMode 'once-per-session'
  if (displayMode === 'once-per-session' && sessionStorage.getItem('emailVerificationBannerDismissed') === 'true') {
    return null;
  }

  const handleClose = (): void => {
    setOpen(false);
    
    if (displayMode === 'once') {
      localStorage.setItem('emailVerificationBannerDismissed', 'true');
    } else if (displayMode === 'once-per-session') {
      sessionStorage.setItem('emailVerificationBannerDismissed', 'true');
    }
  };

  const handleResendVerification = async (): Promise<void> => {
    setIsResending(true);
    try {
      await dispatch(sendEmailVerification());
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Collapse in={open}>
      <Alert 
        severity="warning"
        action={
          <>
            <Button
              color="inherit"
              size="small"
              onClick={handleResendVerification}
              disabled={isResending}
              sx={{ mr: 1 }}
            >
              {isResending ? (
                <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
              ) : null}
              {isResending ? 'Invio in corso...' : 'Invia di nuovo'}
            </Button>
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </>
        }
        sx={{ 
          mb: 2,
          '& .MuiAlert-message': {
            display: 'flex',
            alignItems: 'center'
          }
        }}
      >
        <AlertTitle>Email non verificata</AlertTitle>
        Per favore verifica il tuo indirizzo email ({user?.email}) per sbloccare tutte le funzionalità.
        Controlla la tua casella di posta per il link di verifica.
      </Alert>
    </Collapse>
  );
};

export default EmailVerificationBanner;