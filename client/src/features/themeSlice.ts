import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {RootState} from "../app/store";

interface ThemeState {
  theme: string;
}

const initialState: ThemeState = {
  theme: "light",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", theme);
      document.documentElement.classList.toggle("dark");
      state.theme = theme;
    },
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },
    loadTheme: (state) => {
      const theme = localStorage.getItem("theme");
      if (theme) {
        state.theme = theme;
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        }
      }
    },
  },
});

export const {toggleTheme, setTheme, loadTheme} = themeSlice.actions;

export const selectTheme = (state: RootState) => state.theme;

export default themeSlice.reducer;
