import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { router } from "expo-router";

interface AuthState {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: any; token: any }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      AsyncStorage.removeItem("user");
      AsyncStorage.removeItem("token");
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      router.replace("/(auth)/login");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
