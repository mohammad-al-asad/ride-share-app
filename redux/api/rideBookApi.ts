import type {
  RideFareConfig,
  RidePayment,
  RiderTripRealtime,
  RideRequestItem,
  RideRequestPayload,
} from "../slices/rideBookSlice";
import { baseApi } from "./baseApi";

type FareConfigResponse = {
  success: boolean;
  message: string;
  data: RideFareConfig;
};

type RideRequestResponse = {
  success: boolean;
  message: string;
  data: {
    rideRequest: RideRequestItem;
    recentPlacesCount: number;
  };
};

type PaymentSetupIntentResponse = {
  success: boolean;
  message: string;
  data: {
    message: string;
    setupIntentId: string;
    clientSecret: string;
    publishableKey: string;
    customerId: string | null;
    defaultPaymentMethodId: string | null;
    paymentMethod: unknown | null;
  };
};

type SavePaymentMethodResponse = {
  success: boolean;
  message: string;
  data?: {
    message?: string;
    setupIntentId?: string;
    customerId?: string | null;
    defaultPaymentMethodId?: string | null;
    paymentMethod?: unknown | null;
  };
  error?: unknown;
};

type NearbyDriversRequest = {
  lat: number;
  lng: number;
};

type NearbyDriver = {
  driverId: string;
  name: string;
  profileImage: string;
  ratingAvg: number;
  ratingCount: number;
  location: {
    point: {
      type: "Point";
      coordinates: [number, number];
    };
    updatedAt: string;
  };
  vehicle: {
    _id: string;
    brand: string;
    model: string;
    type: string;
    size: string;
    licensePlate: string;
  };
};

type NearbyDriversResponse = {
  success: boolean;
  message: string;
  data: {
    drivers: NearbyDriver[];
    radiusKm: number;
  };
};

type ActiveRideResponse = {
  success: boolean;
  message: string;
  data: {
    activeRequest: RideRequestItem | null;
    activeTrip: RiderTripRealtime | null;
  };
};

type RiderTripDriverProfile = {
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

type RiderTripVehicleProfile = {
  _id?: string;
  brand?: string;
  model?: string;
  type?: string;
  size?: string;
  licensePlate?: string | null;
};

type RiderTripDriverReview = {
  _id?: string;
  stars?: number;
  comment?: string;
  createdAt?: string;
  rider?: {
    _id?: string;
    name?: string;
    profileImage?: string | null;
  };
};

type RiderTripDriverProfileResponse = {
  success: boolean;
  message: string;
  data: {
    driver: RiderTripDriverProfile;
    vehicle: RiderTripVehicleProfile | null;
    reviews: RiderTripDriverReview[];
  };
};

type CancelTripPayload = {
  tripId: string;
  body: {
    distanceMiles: number;
    durationMinutes: number;
    finalFare: number;
  };
};

type CancelTripResponse = {
  success: boolean;
  message: string;
  data: {
    message: string;
    cancellationFee?: number;
    trip: RiderTripRealtime;
  };
};

type CancelRideRequestPayload = {
  requestId: string;
};

type CancelRideRequestResponse = {
  success: boolean;
  message: string;
  data: {
    message: string;
    rideRequest: RideRequestItem;
  };
};

export const rideBookApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFareConfig: builder.query<FareConfigResponse, void>({
      query: () => ({
        url: "admin/config/",
        method: "GET",
      }),
    }),
    createRideRequest: builder.mutation<RideRequestResponse, RideRequestPayload>({
      query: (body) => ({
        url: "riderGetRide/ride-request",
        method: "POST",
        body,
      }),
    }),
    createPaymentSetupIntent: builder.mutation<PaymentSetupIntentResponse, void>({
      query: () => ({
        url: "riderGetRide/payment-method/setup-intent",
        method: "POST",
      }),
    }),
    savePaymentMethod: builder.mutation<
      SavePaymentMethodResponse,
      Pick<RidePayment, "setupIntentId">
    >({
      query: (body) => ({
        url: "riderGetRide/payment-method/save",
        method: "POST",
        body,
      }),
    }),
    getNearbyDrivers: builder.mutation<NearbyDriversResponse, NearbyDriversRequest>(
      {
        query: (body) => ({
          url: "riderGetRide/nearby-drivers",
          method: "POST",
          body,
        }),
      },
    ),
    getActiveRide: builder.query<ActiveRideResponse, void>({
      query: () => ({
        url: "riderGetRide/active",
        method: "GET",
      }),
    }),
    getRiderTripDriverProfile: builder.query<RiderTripDriverProfileResponse, string>(
      {
        query: (tripId) => ({
          url: `riderGetRide/trip/${tripId}/driver-profile`,
          method: "GET",
        }),
      },
    ),
    cancelRiderTrip: builder.mutation<CancelTripResponse, CancelTripPayload>({
      query: ({ tripId, body }) => ({
        url: `riderGetRide/trip/${tripId}/cancel`,
        method: "PATCH",
        body,
      }),
    }),
    cancelRideRequest: builder.mutation<
      CancelRideRequestResponse,
      CancelRideRequestPayload
    >({
      query: ({ requestId }) => ({
        url: `riderGetRide/ride-request/${requestId}/cancel`,
        method: "PATCH",
      }),
    }),
  }),
});

export const {
  useGetFareConfigQuery,
  useCreateRideRequestMutation,
  useCreatePaymentSetupIntentMutation,
  useSavePaymentMethodMutation,
  useGetNearbyDriversMutation,
  useGetActiveRideQuery,
  useGetRiderTripDriverProfileQuery,
  useCancelRiderTripMutation,
  useCancelRideRequestMutation,
} = rideBookApi;
