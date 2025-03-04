import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Tipo per il tema
export type ThemeMode = "light" | "dark";

// Interfaccia per lo stato del tema
interface ThemeState {
  theme: ThemeMode;
}

// Determina il tema iniziale basandosi su localStorage o preferenze di sistema
const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return "light";

  try {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch (error) {
    console.error("Errore nell'inizializzazione del tema:", error);
    return "light";
  }
};

// Stato iniziale
const initialState: ThemeState = {
  theme: getInitialTheme(),
};

// Slice Redux per il tema
const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.theme);
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      localStorage.setItem("theme", state.theme);
    },
  },
});

// Selettori
export const selectTheme = (state: RootState) => state.theme.theme;
export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
