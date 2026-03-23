import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  DriverAcceptedTrip,
  DriverHomeData,
  DriverRideLocation,
  DriverRideStatusData,
  driverRideStartApi,
} from "../api/driverRIdeStart";

type DriverRideStartState = {
  message: string | null;
  isOnline: boolean;
  isBusy: boolean;
  driverStatus: string | null;
  documentsStatus: string | null;
  requiredActionsCount: number;
  earningsTotal: number;
  tripsCount: number;
  activeVehicleId: string | null;
  location: DriverRideLocation | null;
  activeTrip: DriverAcceptedTrip | null;
  activeRideRequest: DriverHomeData["activeRideRequest"];
};

const initialState: DriverRideStartState = {
  message: null,
  isOnline: false,
  isBusy: false,
  driverStatus: null,
  documentsStatus: null,
  requiredActionsCount: 0,
  earningsTotal: 0,
  tripsCount: 0,
  activeVehicleId: null,
  location: null,
  activeTrip: null,
  activeRideRequest: null,
};

const applyDriverStatus = (
  state: DriverRideStartState,
  payload: DriverRideStatusData,
) => {
  state.message = payload.message;

  if (typeof payload.isOnline === "boolean") {
    state.isOnline = payload.isOnline;
  }

  if (typeof payload.isBusy === "boolean") {
    state.isBusy = payload.isBusy;
  }

  if (payload.location) {
    state.location = payload.location;
  }
};

const applyDriverHomeState = (
  state: DriverRideStartState,
  payload: DriverHomeData,
) => {
  state.message = null;
  state.isOnline = payload.driverProfile.isOnline;
  state.isBusy = payload.driverProfile.isBusy;
  state.driverStatus = payload.driverProfile.status;
  state.documentsStatus = payload.driverProfile.documentsStatus;
  state.requiredActionsCount = payload.driverProfile.requiredActionsCount;
  state.earningsTotal = payload.driverProfile.earningsTotal;
  state.tripsCount = payload.driverProfile.tripsCount;
  state.activeVehicleId = payload.driverProfile.activeVehicleId;
  state.activeRideRequest = payload.activeRideRequest;
  state.activeTrip = payload.activeTrip;
};

const driverRideStartSlice = createSlice({
  name: "driverRideStart",
  initialState,
  reducers: {
    setDriverRideStatus: (
      state,
      action: PayloadAction<Partial<DriverRideStartState>>,
    ) => {
      const {
        message,
        isOnline,
        isBusy,
        driverStatus,
        documentsStatus,
        requiredActionsCount,
        earningsTotal,
        tripsCount,
        activeVehicleId,
        location,
        activeTrip,
        activeRideRequest,
      } = action.payload;

      if (message !== undefined) {
        state.message = message;
      }
      if (isOnline !== undefined) {
        state.isOnline = isOnline;
      }
      if (isBusy !== undefined) {
        state.isBusy = isBusy;
      }
      if (driverStatus !== undefined) {
        state.driverStatus = driverStatus ?? null;
      }
      if (documentsStatus !== undefined) {
        state.documentsStatus = documentsStatus ?? null;
      }
      if (requiredActionsCount !== undefined) {
        state.requiredActionsCount = requiredActionsCount;
      }
      if (earningsTotal !== undefined) {
        state.earningsTotal = earningsTotal;
      }
      if (tripsCount !== undefined) {
        state.tripsCount = tripsCount;
      }
      if (activeVehicleId !== undefined) {
        state.activeVehicleId = activeVehicleId ?? null;
      }
      if (location !== undefined) {
        state.location = location ?? null;
      }
      if (activeTrip !== undefined) {
        state.activeTrip = activeTrip ?? null;
      }
      if (activeRideRequest !== undefined) {
        state.activeRideRequest = activeRideRequest ?? null;
      }
    },
    resetDriverRideStatus: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        driverRideStartApi.endpoints.getDriverHome.matchFulfilled,
        (state, action) => {
          applyDriverHomeState(state, action.payload.data);
        },
      )
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
        driverRideStartApi.endpoints.updateLocation.matchFulfilled,
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
          state.activeRideRequest = null;
        },
      )
      .addMatcher(
        driverRideStartApi.endpoints.cancelTrip.matchFulfilled,
        (state, action) => {
          state.message = action.payload.data.message;
          state.isBusy = false;
          state.activeTrip = null;
        },
      );
  },
});

export const { setDriverRideStatus, resetDriverRideStatus } =
  driverRideStartSlice.actions;

export default driverRideStartSlice.reducer;
