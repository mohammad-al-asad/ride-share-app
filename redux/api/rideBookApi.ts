import type {
  RideFareConfig,
  RidePayment,
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
  }),
});

export const {
  useGetFareConfigQuery,
  useCreateRideRequestMutation,
  useCreatePaymentSetupIntentMutation,
  useSavePaymentMethodMutation,
  useGetNearbyDriversMutation,
} = rideBookApi;
