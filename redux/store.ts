// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { baseApi } from "./api/baseApi";
import driverRideStartReducer from "./slices/driverRideStartSlice";
import rideBookReducer from "./slices/rideBookSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    driverRideStart: driverRideStartReducer,
    rideBook: rideBookReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
