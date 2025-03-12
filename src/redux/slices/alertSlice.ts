import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AlertSeverity = 'success' | 'info' | 'warning' | 'error';

export interface AlertState {
  open: boolean;
  message: string;
  severity: AlertSeverity;
  autoHideDuration?: number;
}

const initialState: AlertState = {
  open: false,
  message: '',
  severity: 'info',
  autoHideDuration: 6000,
};

export const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    showAlert: (state, action: PayloadAction<{ message: string; severity?: AlertSeverity; autoHideDuration?: number }>) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity || 'info';
      state.autoHideDuration = action.payload.autoHideDuration || 6000;
    },
    hideAlert: (state) => {
      state.open = false;
    },
  },
});

export const { showAlert, hideAlert } = alertSlice.actions;

export default alertSlice.reducer;
