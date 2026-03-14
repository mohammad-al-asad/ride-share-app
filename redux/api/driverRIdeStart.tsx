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
  }),
});

export const { useGoOnlineMutation, useGoOfflineMutation } = driverRideStartApi;
