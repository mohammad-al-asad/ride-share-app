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

export type VerifyTripOtpPayload = {
  tripId: string;
  otp: string;
};

export type CompleteTripPayload = {
  tripId: string;
};

export type SubmitRiderReviewPayload = {
  tripId: string;
  body: {
    stars: number;
    comment?: string;
  };
};

export type ArrivedAtPickupPayload = {
  tripId: string;
};

export type ArrivedAtPickupData = {
  message: string;
  trip: DriverAcceptedTrip;
};

export type ArrivedAtPickupResponse = {
  success: boolean;
  message: string;
  data: ArrivedAtPickupData;
};

export type VerifyTripOtpData = {
  message: string;
  trip: DriverAcceptedTrip;
};

export type VerifyTripOtpResponse = {
  success: boolean;
  message: string;
  data: VerifyTripOtpData;
};

export type CompleteTripData = {
  message: string;
  trip: DriverAcceptedTrip;
  paymentSummary?: {
    totalFare?: number;
    driverGets?: number;
    platformGets?: number;
    paymentStatus?: string;
  };
  autoCharge?: {
    attempted?: boolean;
    succeeded?: boolean;
    status?: string;
    failureMessage?: string;
    paymentIntentId?: string | null;
    paymentMethodId?: string | null;
    stripeCustomerId?: string | null;
    driverGets?: number;
    platformGets?: number;
  };
};

export type CompleteTripResponse = {
  success: boolean;
  message: string;
  data: CompleteTripData;
};

export type SubmitRiderReviewResponse = {
  success: boolean;
  message: string;
  data?: {
    message?: string;
    rating?: {
      _tripId?: string;
      _fromUserId?: string;
      _toUserId?: string;
      stars?: number;
      comment?: string;
      _id?: string;
      createdAt?: string;
      updatedAt?: string;
    };
    riderRatingSummary?: {
      ratingAvg?: number;
      ratingCount?: number;
    };
  };
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

export type DriverEarningsSummaryPayload = {
  period: "week" | "month" | "year";
  year: number;
  month?: number;
  week?: number;
};

export type DriverEarningsSummaryResponse = {
  success: boolean;
  message: string;
  data: {
    filter: {
      period: string;
      year: number;
      month?: number;
      week?: number;
      label: string;
      startAt: string;
      endAt: string;
    };
    currency: string;
    summary: {
      earnings: number;
      trips: number;
      paidTrips: number;
      unpaidTrips: number;
      totalDistanceMiles: number;
      tripDuration: {
        minutes: number;
        hours: number;
        human: string;
      };
      onlineTime: {
        minutes: number;
        hours: number;
        human: string;
      };
      rating: {
        periodAverage: number;
        periodCount: number;
        overallAverage: number;
        overallCount: number;
      };
    };
    overall: {
      earnings: number;
      trips: number;
      totalDistanceMiles: number;
      tripDuration: {
        minutes: number;
        hours: number;
        human: string;
      };
      onlineTime: {
        minutes: number;
        hours: number;
        human: string;
      };
      rating: {
        average: number;
        count: number;
      };
    };
    availablePeriods: {
      year: number;
      months: {
        month: number;
        weeks: number[];
      }[];
    }[];
  };
};

export type DriverEarningsTodayResponse = {
  success: boolean;
  message: string;
  data: {
    filter: {
      period: string;
      label: string;
      startAt: string;
      endAt: string;
      year?: number;
      month?: number;
      week?: number;
    };
    currency: string;
    summary: {
      earnings: number;
      trips: number;
      paidTrips: number;
      unpaidTrips: number;
      totalDistanceMiles: number;
      tripDuration: {
        minutes: number;
        hours: number;
        human: string;
      };
      onlineTime: {
        minutes: number;
        hours: number;
        human: string;
      };
      rating?: {
        periodAverage?: number;
        periodCount?: number;
        overallAverage?: number;
        overallCount?: number;
      };
    };
  };
};

export type DriverTripCounterparty = {
  _id: string;
  name: string;
  profileImage: string | null;
  ratingAvg: number;
  ratingCount: number;
  emergency?: unknown | null;
};

export type DriverTripVehicle = {
  _id: string;
  brand: string;
  model: string;
  type: string;
  size: string;
  licensePlate: string;
};

export type DriverTripFare = {
  currency: string;
  estimatedFare?: number;
  finalFare?: number;
  totalFare?: number;
  driverGets?: number;
  platformGets?: number;
  pricePerMile?: number;
  pricePerMinute?: number;
};

export type DriverTripHistoryItem = {
  _id: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  pickup: DriverTripStop;
  dropoff: DriverTripStop;
  pickupAddress?: string;
  destination?: string;
  distanceMiles?: number;
  durationMinutes?: number;
  fare?: DriverTripFare;
  pricing?: DriverTripPricing;
  rideOption?: DriverTripRideOption;
  cancellation?: {
    canceledBy?: string;
    reason?: string;
    canceledAt?: string;
    feeCharged?: number;
    rule?: string;
  };
  rider?: DriverTripCounterparty;
  vehicle?: DriverTripVehicle;
  reviewGiven?: {
    stars?: number;
    comment?: string;
    createdAt?: string;
  } | null;
};

export type DriverTripsResponse = {
  success: boolean;
  message: string;
  data: {
    trips: DriverTripHistoryItem[];
  };
};

type DriverTripSummaryData = {
  message?: string;
  trip?: DriverTripHistoryItem & {
    requestId?: string;
    riderId?: string;
    driverId?: string;
    vehicleId?: string;
    statusHistory?: DriverTripStatusHistoryItem[];
    otp?: {
      hash?: string;
      expiresAt?: string;
      verifiedAt?: string;
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
  paymentSummary?: {
    totalFare?: number;
    driverGets?: number;
    platformGets?: number;
    paymentStatus?: string;
  };
  autoCharge?: {
    attempted?: boolean;
    succeeded?: boolean;
    status?: string;
    failureMessage?: string;
    paymentIntentId?: string | null;
    paymentMethodId?: string | null;
    stripeCustomerId?: string | null;
    driverGets?: number;
    platformGets?: number;
  };
};

export type DriverTripSummaryResponse = {
  success: boolean;
  message: string;
  data:
    | DriverTripSummaryData
    | (DriverTripHistoryItem & {
        requestId?: string;
        statusHistory?: DriverTripStatusHistoryItem[];
        otp?: {
          hash?: string;
          expiresAt?: string;
          verifiedAt?: string;
        };
        payment?: {
          _id?: string;
          status?: string;
          currency?: string;
          totalFare?: number;
          paidAt?: string | null;
          failureMessage?: string | null;
        };
      });
};

export type GetMyDriverReviewsResponse = {
  success: boolean;
  message: string;
  data: {
    driver: {
      _id: string;
      name: string;
      profileImage: string | null;
      ratingAvg: number;
      ratingCount: number;
      tripsCount: number;
      yearsOnPlatform: number;
    };
    vehicle: {
      _id: string;
      brand: string;
      model: string;
      type: string;
      size: string;
      licensePlate: string;
    } | null;
    reviews: {
      _id: string;
      tripId: string;
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
    arrivedAtPickup: builder.mutation<
      ArrivedAtPickupResponse,
      ArrivedAtPickupPayload
    >({
      query: ({ tripId }) => ({
        url: `driverHome/trip/${tripId}/arrived-pickup`,
        method: "PATCH",
      }),
    }),
    verifyTripOtp: builder.mutation<VerifyTripOtpResponse, VerifyTripOtpPayload>({
      query: ({ tripId, otp }) => ({
        url: `driverHome/trip/${tripId}/verify-otp`,
        method: "PATCH",
        body: { otp },
      }),
    }),
    completeTrip: builder.mutation<CompleteTripResponse, CompleteTripPayload>({
      query: ({ tripId }) => ({
        url: `driverHome/trip/${tripId}/complete`,
        method: "PATCH",
      }),
    }),
    submitRiderReview: builder.mutation<
      SubmitRiderReviewResponse,
      SubmitRiderReviewPayload
    >({
      query: ({ tripId, body }) => ({
        url: `driverHome/trip/${tripId}/rider-review`,
        method: "POST",
        body,
      }),
    }),
    getDriverEarningsSummary: builder.query<
      DriverEarningsSummaryResponse,
      DriverEarningsSummaryPayload
    >({
      query: ({ period, year, month, week }) => ({
        url: "driverHome/earnings-summary",
        method: "GET",
        params: {
          period,
          year,
          ...(typeof month === "number" ? { month } : {}),
          ...(typeof week === "number" ? { week } : {}),
        },
      }),
    }),
    getDriverEarningsToday: builder.query<DriverEarningsTodayResponse, void>({
      query: () => ({
        url: "driverHome/earnings-today",
        method: "GET",
      }),
    }),
    getDriverTrips: builder.query<DriverTripsResponse, void>({
      query: () => ({
        url: "driverHome/trips",
        method: "GET",
      }),
    }),
    getDriverTripSummary: builder.query<DriverTripSummaryResponse, string>({
      query: (tripId) => ({
        url: `driverHome/trip/${tripId}/summary`,
        method: "GET",
      }),
    }),
    getTripRiderProfile: builder.query<DriverTripRiderProfileResponse, string>({
      query: (tripId) => ({
        url: `driverHome/trip/${tripId}/rider-profile`,
        method: "GET",
      }),
    }),
    getMyDriverReviews: builder.query<GetMyDriverReviewsResponse, void>({
      query: () => ({
        url: "driverHome/my-reviews",
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
  useArrivedAtPickupMutation,
  useVerifyTripOtpMutation,
  useCompleteTripMutation,
  useSubmitRiderReviewMutation,
  useGetDriverEarningsSummaryQuery,
  useGetDriverEarningsTodayQuery,
  useGetDriverTripsQuery,
  useGetDriverTripSummaryQuery,
  useGetTripRiderProfileQuery,
  useGetMyDriverReviewsQuery,
} = driverRideStartApi;
