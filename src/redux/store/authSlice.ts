import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getUserData } from "../../services/userService";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { AppDispatch } from "../store"; // Import AppDispatch for dispatching

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  coins: number;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// ✅ Safe JSON Parsing Function
const getStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("❌ Invalid JSON in localStorage. Resetting user data.");
    localStorage.removeItem("user"); // ✅ Clear corrupted data
    return null;
  }
};

// ✅ Initial State
const initialState: AuthState = {
  user: getStoredUser(),
  loading: false,
  error: null,
  isAuthenticated: !!getStoredUser(),
};

// ✅ Fetch User Data from Firestore
export const fetchUserData = createAsyncThunk(
  "auth/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const authUser = getStoredUser();
      if (!authUser?.id) throw new Error("No user found in localStorage.");

      const userData = await getUserData(authUser.id);
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData)); // ✅ Store valid JSON
      }
      return userData;
    } catch (error: any) {
      console.error("❌ Error fetching user data:", error);
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Create Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload)); // ✅ Store valid JSON
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem("user", JSON.stringify(action.payload)); // ✅ Store valid JSON
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ✅ Export Actions & Reducer
export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

// ✅ Listen for Auth Changes and Update Redux + LocalStorage
export const listenForAuthChanges = (dispatch: AppDispatch) => {
  const auth = getAuth();

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        console.log("🔥 User detected in onAuthStateChanged:", user.uid);

        // ✅ Fetch user data from Firestore
        const userData = await getUserData(user.uid);

        if (userData) {
          console.log("✅ User data fetched from Firestore:", userData);

          dispatch(loginSuccess(userData)); // ✅ Update Redux state
          localStorage.setItem("user", JSON.stringify(userData)); // ✅ Store valid JSON
        } else {
          console.error("❌ User data not found in Firestore.");
        }

      } catch (error) {
        console.error("❌ Error fetching user data:", error);
      }
    } else {
      console.log("👤 User logged out.");
      dispatch(logout()); // ✅ Ensure logout updates Redux
      localStorage.removeItem("user");
    }
  });
};
