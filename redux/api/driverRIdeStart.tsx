import type { RideRequestItem } from "../slices/rideBookSlice";
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
  isOnline?: boolean;
  isBusy?: boolean;
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

export type DriverHomeProfile = {
  _id: string;
  name: string;
  profileImage: string | null;
};

export type DriverHomeDriverProfile = {
  status: string;
  isOnline: boolean;
  isBusy: boolean;
  documentsStatus: string;
  requiredActionsCount: number;
  earningsTotal: number;
  tripsCount: number;
  activeVehicleId: string | null;
};

export type DriverHomeData = {
  profile: DriverHomeProfile;
  driverProfile: DriverHomeDriverProfile;
  activeRideRequest: RideRequestItem | null;
  activeTrip: DriverAcceptedTrip | null;
};

export type DriverHomeResponse = {
  success: boolean;
  message: string;
  data: DriverHomeData;
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

export type CancelTripPayload = {
  tripId: string;
};

export type CancelTripData = {
  message: string;
  trip: DriverAcceptedTrip;
};

export type CancelTripResponse = {
  success: boolean;
  message: string;
  data: CancelTripData;
};

export type DriverRiderProfile = {
  _id: string;
  name: string;
  profileImage?: string | null;
  ratingAvg?: number;
  ratingCount?: number;
  tripsCount?: number;
  profileCreatedAt?: string;
  daysOnPlatform?: number;
  yearsOnPlatform?: number;
};

export type DriverRiderReview = {
  _id?: string;
  stars?: number;
  comment?: string;
  createdAt?: string;
  driver?: {
    _id?: string;
    name?: string;
    profileImage?: string | null;
  };
  rider?: {
    _id?: string;
    name?: string;
    profileImage?: string | null;
  };
};

export type DriverTripRiderProfileResponse = {
  success: boolean;
  message: string;
  data: {
    rider: DriverRiderProfile;
    reviews: DriverRiderReview[];
  };
};

export const driverRideStartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDriverHome: builder.query<DriverHomeResponse, void>({
      query: () => ({
        url: "driverHome/home",
        method: "GET",
      }),
    }),
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
    updateLocation: builder.mutation<
      DriverRideStatusResponse,
      DriverGoOnlinePayload
    >({
      query: (body) => ({
        url: "driverHome/location",
        method: "PATCH",
        body,
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
    cancelTrip: builder.mutation<CancelTripResponse, CancelTripPayload>({
      query: ({ tripId }) => ({
        url: `driverHome/trip/${tripId}/cancel`,
        method: "PATCH",
      }),
    }),
    getTripRiderProfile: builder.query<DriverTripRiderProfileResponse, string>({
      query: (tripId) => ({
        url: `driverHome/trip/${tripId}/rider-profile`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetDriverHomeQuery,
  useGoOnlineMutation,
  useGoOfflineMutation,
  useUpdateLocationMutation,
  useAcceptRideRequestMutation,
  useCancelTripMutation,
  useGetTripRiderProfileQuery,
} = driverRideStartApi;
