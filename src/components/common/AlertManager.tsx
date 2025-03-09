import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert } from '@mui/material';

import { RootState } from '../../redux/store';
import { removeAlert } from '../../redux/slices/uiSlice';

/**
 * Componente per la gestione centralizzata degli alert nell'applicazione
 * Mostra gli alert in coda e li rimuove dopo il tempo specificato
 */
const AlertManager: React.FC = () => {
  const dispatch = useDispatch();
  const alerts = useSelector((state: RootState) => state.ui.alerts);

  /**
   * Gestisce la chiusura di un alert
   * @param id - ID dell'alert da chiudere
   */
  const handleClose = (id: number): void => {
    dispatch(removeAlert(id));
  };

  /**
   * Gestisce la chiusura automatica di un alert allo scadere del timer
   * @param id - ID dell'alert da chiudere
   */
  const handleAutoClose = (_event: React.SyntheticEvent | Event, reason?: string, id?: number): void => {
    if (reason === 'clickaway' || !id) {
      return;
    }
    
    dispatch(removeAlert(id));
  };

  if (alerts.length === 0) return null;

  return (
    <div>
      {alerts.map((alert) => (
        <Snackbar
          key={alert.id}
          open={true}
          autoHideDuration={alert.autoHideDuration}
          onClose={(event, reason) => handleAutoClose(event, reason, alert.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 8, mr: 2 }} // Per evitare sovrapposizioni con AppBar
        >
          <Alert
            onClose={() => handleClose(alert.id)}
            severity={alert.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      ))}
    </div>
  );
};

export default AlertManager;