import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { rideBookApi } from "../api/rideBookApi";

export type RideScheduleKind = "now" | "later";
export type RideVehicleType = "car" | "suv" | "van";
export type RideTier = "regular" | "premium";

export type RideLocation = {
  address: string;
  lat: number;
  lng: number;
};

export type RideSchedule = {
  kind: RideScheduleKind;
  pickupAt?: string | null;
};

export type RidePreference = {
  vehicleType: RideVehicleType;
  tier: RideTier;
  seats: number;
};

export type RidePayment = {
  setupIntentId: string;
  paymentMethodId: string | null;
  customerId: string | null;
  defaultPaymentMethodId: string | null;
  card: {
    brand: string | null;
    last4: string | null;
    expMonth: number | null;
    expYear: number | null;
  } | null;
};

export type RideFareConfig = {
  _id: string;
  name: string;
  active: boolean;
  currency: string;
  baseFare: Record<string, number>;
  pricePerMile: number;
  pricePerMinute: number;
  driverSharePercent: number;
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
};

export type RideRequestPayload = {
  pickup: RideLocation;
  dropoff: RideLocation;
  schedule: RideSchedule;
  preference: RidePreference;
  payment: RidePayment;
  estimatedMiles: number;
  estimatedMinutes: number;
};

export type RideRequestItem = {
  _id: string;
  riderId: string;
  pickup: {
    address: string;
    point: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  dropoff: {
    address: string;
    point: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  schedule: {
    kind: RideScheduleKind;
    pickupAt: string | null;
  };
  preference: RidePreference;
  status: string;
  quote: {
    currency: string;
    estimatedMiles: number;
    estimatedMinutes: number;
    baseFare: number;
    estimatedFare: number;
    driverSharePercent: number;
  };
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type RidePoint = {
  type: "Point";
  coordinates: [number, number];
};

export type RideStop = {
  address?: string;
  point?: RidePoint;
};

export type RiderTripRealtime = {
  _id: string;
  requestId?: string;
  riderId?: string;
  driverId?: string;
  vehicleId?: string;
  otp?: {
    hash?: string;
    expiresAt?: string;
    verifiedAt?: string | null;
  };
  pickup?: RideStop;
  dropoff?: RideStop;
  status?: string;
  pricing?: {
    currency?: string;
    estimatedFare?: number;
    finalFare?: number;
  };
  rideOption?: {
    vehicleType?: string;
    tier?: string;
    seats?: number;
  };
};

export type RideDriverProgress = {
  target?: string;
  currentLocation?: {
    point?: RidePoint;
    updatedAt?: string | null;
  } | null;
  distanceMeters?: number | null;
  distanceKm?: number | null;
  etaMinutes?: number | null;
  updatedAt?: string | null;
};

export type RideMatchedPayload = {
  requestId: string;
  matchedDriverId: string;
  trip: RiderTripRealtime;
  driver?: {
    _id: string;
    name: string;
    profileImage?: string | null;
    ratingAvg?: number;
    ratingCount?: number;
    tripsCount?: number;
    phone?: string | null;
  };
  vehicle?: {
    _id?: string;
    brand?: string;
    model?: string;
    type?: string;
    seats?: number;
    licensePlate?: string | null;
  } | null;
  fare?: {
    currency?: string;
    estimatedFare?: number;
    finalFare?: number;
  };
  pickupProgress?: RideDriverProgress | null;
  note?: {
    pickupInstruction?: string;
    otpInstruction?: string;
    cancellationRule?: string;
  };
};

type RideBookState = {
  step1: {
    pickup: RideLocation | null;
    dropoff: RideLocation | null;
    schedule: RideSchedule;
  };
  step2: {
    preference: RidePreference | null;
    fareConfig: RideFareConfig | null;
  };
  payment: RidePayment | null;
  estimate: {
    estimatedMiles: number | null;
    estimatedMinutes: number | null;
  };
  latestRideRequest: RideRequestItem | null;
  activeTrip: RiderTripRealtime | null;
  matchedDriver: RideMatchedPayload["driver"] | null;
  matchedVehicle: RideMatchedPayload["vehicle"] | null;
  driverProgress: RideDriverProgress | null;
};

const initialState: RideBookState = {
  step1: {
    pickup: null,
    dropoff: null,
    schedule: {
      kind: "now",
      pickupAt: null,
    },
  },
  step2: {
    preference: null,
    fareConfig: null,
  },
  payment: null,
  estimate: {
    estimatedMiles: null,
    estimatedMinutes: null,
  },
  latestRideRequest: null,
  activeTrip: null,
  matchedDriver: null,
  matchedVehicle: null,
  driverProgress: null,
};

const rideBookSlice = createSlice({
  name: "rideBook",
  initialState,
  reducers: {
    setStep1Locations: (
      state,
      action: PayloadAction<{
        pickup?: RideLocation | null;
        dropoff?: RideLocation | null;
      }>,
    ) => {
      const { pickup, dropoff } = action.payload;
      if (pickup !== undefined) {
        state.step1.pickup = pickup;
      }
      if (dropoff !== undefined) {
        state.step1.dropoff = dropoff;
      }
    },
    setRideSchedule: (state, action: PayloadAction<RideSchedule>) => {
      state.step1.schedule = action.payload;
    },
    setRidePreference: (state, action: PayloadAction<RidePreference>) => {
      state.step2.preference = action.payload;
    },
    setFareConfig: (state, action: PayloadAction<RideFareConfig | null>) => {
      state.step2.fareConfig = action.payload;
    },
    setRidePayment: (state, action: PayloadAction<RidePayment>) => {
      state.payment = action.payload;
    },
    setRideEstimate: (
      state,
      action: PayloadAction<{
        estimatedMiles: number | null;
        estimatedMinutes: number | null;
      }>,
    ) => {
      state.estimate.estimatedMiles = action.payload.estimatedMiles;
      state.estimate.estimatedMinutes = action.payload.estimatedMinutes;
    },
    setLatestRideRequest: (
      state,
      action: PayloadAction<RideRequestItem | null>,
    ) => {
      state.latestRideRequest = action.payload;
    },
    setRideMatchedData: (state, action: PayloadAction<RideMatchedPayload | null>) => {
      const payload = action.payload;

      if (!payload) {
        state.activeTrip = null;
        state.matchedDriver = null;
        state.matchedVehicle = null;
        state.driverProgress = null;
        return;
      }

      state.activeTrip = payload.trip;
      state.matchedDriver = payload.driver ?? null;
      state.matchedVehicle = payload.vehicle ?? null;
      state.driverProgress = payload.pickupProgress ?? null;

      if (state.latestRideRequest) {
        state.latestRideRequest.status = "matched";
      }
    },
    setRideDriverProgress: (
      state,
      action: PayloadAction<RideDriverProgress | null>,
    ) => {
      state.driverProgress = action.payload;
    },
    clearActiveRide: (state) => {
      state.activeTrip = null;
      state.latestRideRequest = null;
      state.matchedDriver = null;
      state.matchedVehicle = null;
      state.driverProgress = null;
    },
    resetRideBook: (state) => {
      state.step1 = {
        pickup: null,
        dropoff: null,
        schedule: {
          kind: "now",
          pickupAt: null,
        },
      };
      state.step2 = {
        preference: null,
        fareConfig: null,
      };
      state.payment = null;
      state.estimate = {
        estimatedMiles: null,
        estimatedMinutes: null,
      };
      state.latestRideRequest = null;
      state.activeTrip = null;
      state.matchedDriver = null;
      state.matchedVehicle = null;
      state.driverProgress = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        rideBookApi.endpoints.getActiveRide.matchFulfilled,
        (state, action) => {
          const { activeRequest, activeTrip } = action.payload.data;
          state.latestRideRequest = activeRequest ?? null;
          state.activeTrip = activeTrip ?? null;

          // Active ride endpoint does not include driver/vehicle/progress details.
          state.matchedDriver = null;
          state.matchedVehicle = null;
          state.driverProgress = null;
        },
      )
      .addMatcher(
        rideBookApi.endpoints.cancelRiderTrip.matchFulfilled,
        (state) => {
          state.latestRideRequest = null;
          state.activeTrip = null;
          state.matchedDriver = null;
          state.matchedVehicle = null;
          state.driverProgress = null;
        },
      )
      .addMatcher(
        rideBookApi.endpoints.cancelRideRequest.matchFulfilled,
        (state) => {
          state.latestRideRequest = null;
          state.activeTrip = null;
          state.matchedDriver = null;
          state.matchedVehicle = null;
          state.driverProgress = null;
        },
      )
      .addMatcher(
        rideBookApi.endpoints.changeRideRequestDestination.matchFulfilled,
        (state, action) => {
          const rideRequest = action.payload.data.rideRequest;
          const dropoffCoordinates = rideRequest?.dropoff?.point?.coordinates;
          const newQuote = action.payload.data.newQuote;

          state.latestRideRequest = rideRequest ?? null;

          if (
            Array.isArray(dropoffCoordinates) &&
            dropoffCoordinates.length >= 2 &&
            typeof dropoffCoordinates[0] === "number" &&
            typeof dropoffCoordinates[1] === "number"
          ) {
            state.step1.dropoff = {
              address: rideRequest.dropoff.address,
              lat: dropoffCoordinates[1],
              lng: dropoffCoordinates[0],
            };
          }

          if (newQuote) {
            if (typeof newQuote.estimatedMiles === "number") {
              state.estimate.estimatedMiles = newQuote.estimatedMiles;
            }
            if (typeof newQuote.estimatedMinutes === "number") {
              state.estimate.estimatedMinutes = newQuote.estimatedMinutes;
            }
          }
        },
      )
      .addMatcher(
        rideBookApi.endpoints.changeTripDestination.matchFulfilled,
        (state, action) => {
          const trip = action.payload.data.trip;
          const dropoffCoordinates = trip?.dropoff?.point?.coordinates;
          const newFare = action.payload.data.newFare;

          state.activeTrip = trip ?? null;

          if (
            Array.isArray(dropoffCoordinates) &&
            dropoffCoordinates.length >= 2 &&
            typeof dropoffCoordinates[0] === "number" &&
            typeof dropoffCoordinates[1] === "number"
          ) {
            state.step1.dropoff = {
              address: trip.dropoff?.address ?? "Updated dropoff",
              lat: dropoffCoordinates[1],
              lng: dropoffCoordinates[0],
            };
          }

          if (newFare) {
            if (typeof newFare.estimatedMiles === "number") {
              state.estimate.estimatedMiles = newFare.estimatedMiles;
            }
            if (typeof newFare.estimatedMinutes === "number") {
              state.estimate.estimatedMinutes = newFare.estimatedMinutes;
            }
          }
        },
      );
  },
});

export const {
  setStep1Locations,
  setRideSchedule,
  setRidePreference,
  setFareConfig,
  setRidePayment,
  setRideEstimate,
  setLatestRideRequest,
  setRideMatchedData,
  setRideDriverProgress,
  clearActiveRide,
  resetRideBook,
} = rideBookSlice.actions;

export default rideBookSlice.reducer;
