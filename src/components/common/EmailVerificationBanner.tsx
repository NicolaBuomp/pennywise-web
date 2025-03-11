// src/components/common/EmailVerificationBanner.tsx
import React, { useState } from 'react';
import { Alert, Button, Collapse, IconButton, Stack } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { sendEmailVerification } from '../../redux/thunks/authThunks';

interface EmailVerificationBannerProps {
  displayMode?: 'always' | 'once-per-session';
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ 
  displayMode = 'always' 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isEmailVerified, user } = useSelector((state: RootState) => state.auth);
  const [open, setOpen] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Gestisce la visualizzazione "once-per-session"
  const sessionKey = 'email_banner_dismissed';
  React.useEffect(() => {
    if (displayMode === 'once-per-session') {
      const isDismissed = sessionStorage.getItem(sessionKey) === 'true';
      setOpen(!isDismissed);
    }
  }, [displayMode]);

  // Non mostrare il banner se l'email è già verificata
  if (isEmailVerified) {
    return null;
  }

  const handleSendVerificationEmail = async () => {
    setSending(true);
    try {
      await dispatch(sendEmailVerification(user?.email));
    } catch (error) {
      console.error("Error sending verification email:", error);
    } finally {
      setSending(false);
    }
  };
  
  const handleClose = () => {
    setOpen(false);
    if (displayMode === 'once-per-session') {
      sessionStorage.setItem(sessionKey, 'true');
    }
  };

  return (
    <Collapse in={open}>
      <Alert
        severity="warning"
        variant="filled"
        action={
          <Stack direction="row" spacing={1}>
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              onClick={handleSendVerificationEmail}
              disabled={sending}
            >
              {sending ? 'Invio...' : 'Invia di nuovo'}
            </Button>
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Stack>
        }
        sx={{ mb: 2 }}
      >
        <strong>Importante:</strong> Verifica il tuo indirizzo email entro 48 ore dalla registrazione per evitare limitazioni. 
        Controlla la tua casella di posta e clicca sul link di conferma.
      </Alert>
    </Collapse>
  );
};

export default EmailVerificationBanner;