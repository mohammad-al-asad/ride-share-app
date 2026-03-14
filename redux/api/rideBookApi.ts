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
  }),
});

export const {
  useGetFareConfigQuery,
  useCreateRideRequestMutation,
  useCreatePaymentSetupIntentMutation,
  useSavePaymentMethodMutation,
} = rideBookApi;
