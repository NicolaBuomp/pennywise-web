import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { hideAlert } from '../../redux/slices/alertSlice';

const AlertManager: React.FC = () => {
  const { open, message, severity, autoHideDuration } = useSelector((state: RootState) => state.alert);
  const dispatch = useDispatch();

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideAlert());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertManager;