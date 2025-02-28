import {createSlice, PayloadAction} from "@reduxjs/toolkit";

type ThemeState = {
    theme: "light" | "dark";
};

const initialState: ThemeState = {
    theme: localStorage.getItem("theme") === "dark" ? "dark" : "light", // Recupera il tema dal localStorage
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
