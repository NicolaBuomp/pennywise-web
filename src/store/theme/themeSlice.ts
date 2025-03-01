import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../store";

// Tipo per il tema
export type ThemeMode = "light" | "dark";

// Interfaccia per lo stato del tema
interface ThemeState {
    theme: ThemeMode;
}

/**
 * Determina il tema iniziale basandosi su:
 * 1. Valore in localStorage
 * 2. Preferenze di sistema
 * 3. Tema light come fallback
 */
const getInitialTheme = (): ThemeMode => {
    // Verifica se siamo in un ambiente browser
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return "light"; // Default per SSR o ambienti non browser
    }

    try {
        // 1. Controlla prima il localStorage
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "dark" || storedTheme === "light") {
            document.documentElement.classList.toggle("dark", storedTheme === "dark");
            return storedTheme;
        }

        // 2. Controlla le preferenze del sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add("dark");
            return "dark";
        }

        // 3. Fallback al tema chiaro
        document.documentElement.classList.remove("dark");
        return "light";
    } catch (error) {
        // In caso di errori (es. localStorage non disponibile)
        console.error("Errore nell'inizializzazione del tema:", error);
        return "light";
    }
};

/**
 * Applica il tema al DOM
 */
const applyThemeToDOM = (theme: ThemeMode): void => {
    if (typeof document === 'undefined') return;

    try {
        document.documentElement.classList.toggle("dark", theme === "dark");
    } catch (error) {
        console.error("Errore nell'applicazione del tema al DOM:", error);
    }
};

/**
 * Salva il tema nel localStorage
 */
const saveThemePreference = (theme: ThemeMode): void => {
    if (typeof localStorage === 'undefined') return;

    try {
        localStorage.setItem("theme", theme);
    } catch (error) {
        console.error("Errore nel salvataggio della preferenza del tema:", error);
    }
};

const initialState: ThemeState = {
    theme: getInitialTheme(),
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === "light" ? "dark" : "light";
            applyThemeToDOM(state.theme);
            saveThemePreference(state.theme);
        },
        setTheme: (state, action: PayloadAction<ThemeMode>) => {
            state.theme = action.payload;
            applyThemeToDOM(state.theme);
            saveThemePreference(state.theme);
        },
        syncWithSystemPreference: (state) => {
            if (typeof window === 'undefined') return;

            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            state.theme = prefersDark ? "dark" : "light";
            applyThemeToDOM(state.theme);
            saveThemePreference(state.theme);
        }
    },
});

// Selettori
export const selectTheme = (state: RootState) => state.theme.theme;
export const selectIsDarkMode = (state: RootState) => state.theme.theme === "dark";

export const {toggleTheme, setTheme, syncWithSystemPreference} = themeSlice.actions;
export default themeSlice.reducer;

// Opzionale: Listener per le modifiche alla preferenza di sistema
export const initializeThemeListener = (): (() => void) => {
    if (typeof window === 'undefined') return () => {
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
        const prefersDark = e.matches;
        document.documentElement.classList.toggle("dark", prefersDark);
    };

    // Aggiungi il listener
    try {
        // Metodo moderno
        mediaQuery.addEventListener('change', listener);
        return () => mediaQuery.removeEventListener('change', listener);
    } catch (e) {
        // Fallback per browser più vecchi
        try {
            mediaQuery.addListener(listener);
            return () => mediaQuery.removeListener(listener);
        } catch (e) {
            console.error('Browser non supporta i media query listeners');
            return () => {
            };
        }
    }
};