import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
  profileImage?: string;
  emailVerifiedAt?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
};

/**
 * Persist credentials (side effects allowed here)
 */
export const persistCredentials = createAsyncThunk(
  "auth/persistCredentials",
  async ({
    user,
    token,
    refreshToken,
  }: {
    user: User;
    token?: string | null;
    refreshToken?: string | null;
  }) => {
    await AsyncStorage.setItem("user", JSON.stringify(user));
    if (token !== undefined) {
      if (token) {
        await AsyncStorage.setItem("token", token);
      } else {
        await AsyncStorage.removeItem("token");
      }
    }
    if (refreshToken !== undefined) {
      if (refreshToken) {
        await AsyncStorage.setItem("refreshToken", refreshToken);
      } else {
        await AsyncStorage.removeItem("refreshToken");
      }
    }
    return { user, token, refreshToken };
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
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (user && token) {
      return {
        user: JSON.parse(user),
        token,
        refreshToken,
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
  await AsyncStorage.removeItem("refreshToken");
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
        (
          state,
          action: PayloadAction<{
            user: User;
            token?: string | null;
            refreshToken?: string | null;
          }>,
        ) => {
          state.loading = false;
          state.user = action.payload.user;
          if (action.payload.token !== undefined) {
            state.token = action.payload.token;
          }
          if (action.payload.refreshToken !== undefined) {
            state.refreshToken = action.payload.refreshToken;
          }
          state.isAuthenticated = Boolean(state.token);
        },
      )
      .addCase(loadCredentials.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken ?? null;
          state.isAuthenticated = true;
        }
      })
      .addCase(performLogout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

export default authSlice.reducer;
