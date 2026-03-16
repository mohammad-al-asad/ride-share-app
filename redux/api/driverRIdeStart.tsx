import { baseApi } from "./baseApi";

export type DriverGoOnlinePayload = {
  lat: number;
  lng: number;
};

export type DriverLocationPoint = {
  type: "Point";
  coordinates: [number, number];
};

export type DriverRideLocation = {
  point: DriverLocationPoint;
  updatedAt: string;
};

export type DriverRideStatusData = {
  message: string;
  isOnline: boolean;
  isBusy: boolean;
  location?: DriverRideLocation;
};

export type DriverRideStatusResponse = {
  success: boolean;
  message: string;
  data: DriverRideStatusData;
};

export type DriverTripPoint = {
  type: "Point";
  coordinates: [number, number];
};

export type DriverTripStop = {
  address: string;
  point: DriverTripPoint;
};

export type DriverTripStatusHistoryItem = {
  status: string;
  at: string;
  by: string;
};

export type DriverTripPricing = {
  currency: string;
  baseFare: number;
  pricePerMile: number;
  pricePerMinute: number;
  surgeMultiplier: number;
  driverSharePercent: number;
  estimatedFare: number;
  finalFare: number;
};

export type DriverTripRideOption = {
  vehicleType: string;
  tier: string;
  size: string;
};

export type DriverAcceptedTrip = {
  _id: string;
  requestId: string;
  riderId: string;
  driverId: string;
  vehicleId: string;
  pickup: DriverTripStop;
  dropoff: DriverTripStop;
  status: string;
  statusHistory: DriverTripStatusHistoryItem[];
  distanceMiles: number;
  durationMinutes: number;
  pricing: DriverTripPricing;
  paymentStatus: string;
  rideOption: DriverTripRideOption;
  cancellation: {
    feeCharged: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type AcceptRideRequestPayload = {
  requestId: string;
};

export type AcceptRideRequestData = {
  message: string;
  trip: DriverAcceptedTrip;
};

export type AcceptRideRequestResponse = {
  success: boolean;
  message: string;
  data: AcceptRideRequestData;
};

export const driverRideStartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    goOnline: builder.mutation<DriverRideStatusResponse, DriverGoOnlinePayload>({
      query: (body) => ({
        url: "driverHome/go-online",
        method: "PATCH",
        body,
      }),
    }),
    goOffline: builder.mutation<DriverRideStatusResponse, void>({
      query: () => ({
        url: "driverHome/go-offline",
        method: "PATCH",
      }),
    }),
    acceptRideRequest: builder.mutation<
      AcceptRideRequestResponse,
      AcceptRideRequestPayload
    >({
      query: ({ requestId }) => ({
        url: `driverHome/ride-requests/${requestId}/accept`,
        method: "PATCH",
      }),
    }),
  }),
});

export const {
  useGoOnlineMutation,
  useGoOfflineMutation,
  useAcceptRideRequestMutation,
} = driverRideStartApi;
