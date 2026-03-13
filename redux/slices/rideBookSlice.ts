import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type RideScheduleKind = "now" | "later";
export type RideVehicleType = "car" | "suv" | "van";
export type RideTier = "regular" | "premium";
export type RideSize = "normal" | "compact" | "full";

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
  size: RideSize;
};

export type RidePayment = {
  country: string;
  expirationDate: string;
  cvv: number;
  cardNumber: number;
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
  step3: {
    payment: RidePayment | null;
  };
  estimate: {
    estimatedMiles: number | null;
    estimatedMinutes: number | null;
  };
  latestRideRequest: RideRequestItem | null;
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
  step3: {
    payment: null,
  },
  estimate: {
    estimatedMiles: null,
    estimatedMinutes: null,
  },
  latestRideRequest: null,
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
      state.step3.payment = action.payload;
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
    setLatestRideRequest: (state, action: PayloadAction<RideRequestItem | null>) => {
      state.latestRideRequest = action.payload;
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
      state.step3 = {
        payment: null,
      };
      state.estimate = {
        estimatedMiles: null,
        estimatedMinutes: null,
      };
      state.latestRideRequest = null;
    },
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
  resetRideBook,
} = rideBookSlice.actions;

export default rideBookSlice.reducer;
