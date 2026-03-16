import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  DriverAcceptedTrip,
  DriverRideLocation,
  DriverRideStatusData,
  driverRideStartApi,
} from "../api/driverRIdeStart";

type DriverRideStartState = {
  message: string | null;
  isOnline: boolean;
  isBusy: boolean;
  location: DriverRideLocation | null;
  activeTrip: DriverAcceptedTrip | null;
};

const initialState: DriverRideStartState = {
  message: null,
  isOnline: false,
  isBusy: false,
  location: null,
  activeTrip: null,
};

const applyDriverStatus = (
  state: DriverRideStartState,
  payload: DriverRideStatusData,
) => {
  state.message = payload.message;
  state.isOnline = payload.isOnline;
  state.isBusy = payload.isBusy;

  if (payload.location) {
    state.location = payload.location;
  }
};

const driverRideStartSlice = createSlice({
  name: "driverRideStart",
  initialState,
  reducers: {
    setDriverRideStatus: (
      state,
      action: PayloadAction<Partial<DriverRideStartState>>,
    ) => {
      const { message, isOnline, isBusy, location, activeTrip } = action.payload;

      if (message !== undefined) {
        state.message = message;
      }
      if (isOnline !== undefined) {
        state.isOnline = isOnline;
      }
      if (isBusy !== undefined) {
        state.isBusy = isBusy;
      }
      if (location !== undefined) {
        state.location = location ?? null;
      }
      if (activeTrip !== undefined) {
        state.activeTrip = activeTrip ?? null;
      }
    },
    resetDriverRideStatus: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        driverRideStartApi.endpoints.goOnline.matchFulfilled,
        (state, action) => {
          applyDriverStatus(state, action.payload.data);
        },
      )
      .addMatcher(
        driverRideStartApi.endpoints.goOffline.matchFulfilled,
        (state, action) => {
          applyDriverStatus(state, action.payload.data);
        },
      )
      .addMatcher(
        driverRideStartApi.endpoints.acceptRideRequest.matchFulfilled,
        (state, action) => {
          state.message = action.payload.data.message;
          state.isBusy = true;
          state.activeTrip = action.payload.data.trip;
        },
      );
  },
});

export const { setDriverRideStatus, resetDriverRideStatus } =
  driverRideStartSlice.actions;

export default driverRideStartSlice.reducer;
