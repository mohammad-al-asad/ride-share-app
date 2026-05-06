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
    seats: number;
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
  seats?: number;
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

type SubmitTripRatingPayload = {
  tripId: string;
  body: {
    stars: number;
    comment?: string;
  };
};

type SubmitTripRatingResponse = {
  success: boolean;
  message: string;
  data?: {
    message?: string;
    rating?: {
      tripId?: string;
      fromUserId?: string;
      toUserId?: string;
      stars?: number;
      comment?: string;
      _id?: string;
      createdAt?: string;
      updatedAt?: string;
    };
  };
};

export type DestinationDropoffPayload = {
  address: string;
  lng: number;
  lat: number;
};

export type DestinationMetricsPayload = {
  dropoff: DestinationDropoffPayload;
  estimatedMiles: number;
  estimatedMinutes: number;
};

type RideQuoteSnapshot = {
  currency?: string;
  estimatedMiles?: number;
  estimatedMinutes?: number;
  baseFare?: number;
  estimatedFare?: number;
  finalFare?: number;
  totalFare?: number;
  pricePerMile?: number;
  pricePerMinute?: number;
  driverSharePercent?: number;
};

type CheckRideRequestFarePayload = {
  requestId: string;
  body: DestinationMetricsPayload;
};

type CheckRideRequestFareResponse = {
  success: boolean;
  message: string;
  data: {
    requestId: string;
    currentQuote?: RideQuoteSnapshot;
    checkedQuote?: RideQuoteSnapshot;
  };
};

type CheckTripFarePayload = {
  tripId: string;
  body: DestinationMetricsPayload;
};

type CheckTripFareResponse = {
  success: boolean;
  message: string;
  data: {
    tripId: string;
    currentFare?: RideQuoteSnapshot;
    checkedFare?: RideQuoteSnapshot;
  };
};

type ChangeRideRequestDestinationPayload = {
  requestId: string;
  body: DestinationMetricsPayload;
};

type ChangeRideRequestDestinationResponse = {
  success: boolean;
  message: string;
  data: {
    message: string;
    rideRequest: RideRequestItem;
    newQuote?: RideQuoteSnapshot;
    nearbyDrivers?: unknown[];
  };
};

type ChangeTripDestinationPayload = {
  tripId: string;
  body: DestinationMetricsPayload;
};

type ChangeTripDestinationResponse = {
  success: boolean;
  message: string;
  data: {
    message: string;
    trip: RiderTripRealtime;
    newFare?: RideQuoteSnapshot;
  };
};

export type RiderTripHistoryCounterparty = {
  _id: string;
  name: string;
  profileImage: string | null;
  ratingAvg: number;
  ratingCount: number;
  emergency?: unknown | null;
};

export type RiderTripHistoryVehicle = {
  _id: string;
  brand: string;
  model: string;
  type: string;
  seats: number;
  licensePlate: string;
};

export type RiderTripHistoryFare = {
  currency: string;
  estimatedFare?: number;
  finalFare?: number;
  totalFare?: number;
  pricePerMile?: number;
  pricePerMinute?: number;
  driverGets?: number;
  platformGets?: number;
};

export type RiderTripHistoryItem = {
  _id: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
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
  pickupAddress?: string;
  destination?: string;
  distanceMiles?: number;
  durationMinutes?: number;
  fare?: RiderTripHistoryFare;
  rideOption?: {
    vehicleType?: string;
    tier?: string;
    seats?: number;
  };
  cancellation?: {
    canceledBy?: string;
    reason?: string;
    canceledAt?: string;
    feeCharged?: number;
    rule?: string;
  };
  driver?: RiderTripHistoryCounterparty;
  vehicle?: RiderTripHistoryVehicle;
  reviewGiven?: {
    stars?: number;
    comment?: string;
    createdAt?: string;
  } | null;
};

export type RiderTripsResponse = {
  success: boolean;
  message: string;
  data: {
    trips: RiderTripHistoryItem[];
  };
};

export type RiderTripDetailsResponse = {
  success: boolean;
  message: string;
  data: RiderTripHistoryItem & {
    requestId?: string;
    riderId?: string;
    driverId?: RiderTripHistoryCounterparty | string;
    vehicleId?: RiderTripHistoryVehicle | string;
    statusHistory?: {
      status: string;
      at: string;
      by: string;
    }[];
    otp?: {
      hash?: string;
      expiresAt?: string;
      verifiedAt?: string;
    };
    pricing?: {
      currency?: string;
      estimatedMiles?: number;
      estimatedMinutes?: number;
      baseFare?: number;
      pricePerMile?: number;
      pricePerMinute?: number;
      surgeMultiplier?: number;
      driverSharePercent?: number;
      estimatedFare?: number;
      finalFare?: number;
    };
    payment?: {
      _id?: string;
      status?: string;
      currency?: string;
      totalFare?: number;
      paidAt?: string | null;
      failureMessage?: string | null;
    };
  };
};

type GetMyReviewsResponse = {
  success: boolean;
  message: string;
  data: {
    rider: {
      _id: string;
      name: string;
      profileImage: string | null;
      ratingAvg: number;
      ratingCount: number;
      savedPlacesCount: number;
    };
    reviews: {
      _id: string;
      stars: number;
      comment: string;
      createdAt: string;
      reviewer: {
        _id: string;
        name: string;
        profileImage: string | null;
        role: "driver" | "rider";
      };
    }[];
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
    getRiderTrips: builder.query<RiderTripsResponse, void>({
      query: () => ({
        url: "riderGetRide/trips",
        method: "GET",
      }),
    }),
    getRiderTripDetails: builder.query<RiderTripDetailsResponse, string>({
      query: (tripId) => ({
        url: `riderGetRide/trip/${tripId}/details`,
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
    checkRideRequestFare: builder.mutation<
      CheckRideRequestFareResponse,
      CheckRideRequestFarePayload
    >({
      query: ({ requestId, body }) => ({
        url: `riderGetRide/ride-request/${requestId}/check-fare`,
        method: "POST",
        body,
      }),
    }),
    checkTripFare: builder.mutation<CheckTripFareResponse, CheckTripFarePayload>({
      query: ({ tripId, body }) => ({
        url: `riderGetRide/trip/${tripId}/check-fare`,
        method: "POST",
        body,
      }),
    }),
    changeRideRequestDestination: builder.mutation<
      ChangeRideRequestDestinationResponse,
      ChangeRideRequestDestinationPayload
    >({
      query: ({ requestId, body }) => ({
        url: `riderGetRide/ride-request/${requestId}/change-destination`,
        method: "PATCH",
        body,
      }),
    }),
    changeTripDestination: builder.mutation<
      ChangeTripDestinationResponse,
      ChangeTripDestinationPayload
    >({
      query: ({ tripId, body }) => ({
        url: `riderGetRide/trip/${tripId}/change-destination`,
        method: "PATCH",
        body,
      }),
    }),
    submitTripRating: builder.mutation<
      SubmitTripRatingResponse,
      SubmitTripRatingPayload
    >({
      query: ({ tripId, body }) => ({
        url: `riderGetRide/trip/${tripId}/rating`,
        method: "POST",
        body,
      }),
    }),
    getMyReviews: builder.query<GetMyReviewsResponse, void>({
      query: () => ({
        url: "riderGetRide/my-reviews",
        method: "GET",
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
  useGetRiderTripsQuery,
  useGetRiderTripDetailsQuery,
  useGetRiderTripDriverProfileQuery,
  useCancelRiderTripMutation,
  useCancelRideRequestMutation,
  useCheckRideRequestFareMutation,
  useCheckTripFareMutation,
  useChangeRideRequestDestinationMutation,
  useChangeTripDestinationMutation,
  useSubmitTripRatingMutation,
  useGetMyReviewsQuery,
} = rideBookApi;
