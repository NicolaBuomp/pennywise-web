import {createSlice, PayloadAction} from "@reduxjs/toolkit";

type ThemeState = {
    theme: "light" | "dark";
};

const getInitialTheme = (): "light" | "dark" => {
    // Controlliamo il valore nel localStorage
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
        document.documentElement.classList.add("dark"); // Applicare subito la classe dark
        return "dark";
    }
    document.documentElement.classList.remove("dark"); // Assicuriamoci che la classe venga rimossa se necessario
    return "light";
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
            document.documentElement.classList.toggle("dark", state.theme === "dark");
            localStorage.setItem("theme", state.theme);
        },
        setTheme: (state, action: PayloadAction<"light" | "dark">) => {
            state.theme = action.payload;
            document.documentElement.classList.toggle("dark", state.theme === "dark");
            localStorage.setItem("theme", state.theme);
        },
    },
});

export const {toggleTheme, setTheme} = themeSlice.actions;
export default themeSlice.reducer;
