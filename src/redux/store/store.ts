import { configureStore } from "@reduxjs/toolkit";
import authReducer, { listenForAuthChanges } from "./authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// ✅ Start listening for auth changes when the app loads
listenForAuthChanges(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export default store;
