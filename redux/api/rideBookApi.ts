import type {
  RideFareConfig,
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
  }),
});

export const { useGetFareConfigQuery, useCreateRideRequestMutation } = rideBookApi;
