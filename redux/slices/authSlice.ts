import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id?: string;
  email?: string;
  name?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
};

/**
 * Persist credentials (side effects allowed here)
 */
export const persistCredentials = createAsyncThunk(
  "auth/persistCredentials",
  async ({ user, token }: { user: User; token: string }) => {
    await AsyncStorage.setItem("user", JSON.stringify(user));
    await AsyncStorage.setItem("token", token);
    return { user, token };
  },
);

/**
 * Load credentials on app start
 */
export const loadCredentials = createAsyncThunk(
  "auth/loadCredentials",
  async () => {
    const user = await AsyncStorage.getItem("user");
    const token = await AsyncStorage.getItem("token");

    if (user && token) {
      return {
        user: JSON.parse(user),
        token,
      };
    }

    return null;
  },
);

/**
 * Logout thunk
 */
export const performLogout = createAsyncThunk("auth/logout", async () => {
  await AsyncStorage.removeItem("user");
  await AsyncStorage.removeItem("token");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Persist login
      .addCase(persistCredentials.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        persistCredentials.fulfilled,
        (state, action: PayloadAction<{ user: User; token: string }>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        },
      )
      .addCase(loadCredentials.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(performLogout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export default authSlice.reducer;
