import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  email: string | null;
  isAuthenticated: boolean;
  role: "admin" | "user" | "superadmin" | null;
}

const storedEmail = localStorage.getItem("user");
const storedRole = localStorage.getItem("role") as "admin" | "user" | "superadmin" | null;

const initialState: AuthState = {
  email: storedEmail,
  isAuthenticated: !!storedEmail,
  role: storedRole || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ email: string; role: "admin" | "user" | "superadmin" }>) => {
      state.email = action.payload.email;
      state.isAuthenticated = true;
      state.role = action.payload.role;
      localStorage.setItem("user", action.payload.email);
      localStorage.setItem("role", action.payload.role);
    },
    logout: (state) => {
      state.email = null;
      state.isAuthenticated = false;
      state.role = null;
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
