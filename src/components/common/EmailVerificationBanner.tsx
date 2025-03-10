import React, { useState, useEffect } from 'react';
import { Alert, Button, Collapse, IconButton, Stack } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { sendEmailVerification } from '../../redux/thunks/authThunks';

const EmailVerificationBanner: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isEmailVerified, user } = useSelector((state: RootState) => state.auth);
  const [open, setOpen] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Log per debug
    console.log("Banner component rendered");
    console.log("isEmailVerified:", isEmailVerified);
    console.log("user:", user);
  }, [isEmailVerified, user]);

  // Non mostrare il banner se l'email è già verificata
  if (isEmailVerified) {
    console.log("Email is verified, not showing banner");
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

  console.log("Rendering banner, open state:", open);

  return (
    <Collapse in={open}>
      <Alert
        severity="warning"
        action={
          <Stack direction="row" spacing={1}>
            <Button
              color="inherit"
              size="small"
              onClick={handleSendVerificationEmail}
              disabled={sending}
            >
              {sending ? 'Invio...' : 'Invia di nuovo'}
            </Button>
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setOpen(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Stack>
        }
        sx={{ mb: 2 }}
      >
        Verifica il tuo indirizzo email per sbloccare tutte le funzionalità dell'app. 
        Controlla la tua casella di posta e clicca sul link di conferma.
      </Alert>
    </Collapse>
  );
};

export default EmailVerificationBanner;
