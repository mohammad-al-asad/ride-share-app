// src/redux/api/baseApi.ts
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { performLogout, persistCredentials } from "../slices/authSlice";
import type { RootState } from "../store";

type RefreshResponse = {
  data?: {
    accessToken?: string;
  };
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const getRequestUrl = (args: string | FetchArgs) =>
  (typeof args === "string" ? args : args.url).replace(/^\/+/, "");

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const isUnauthorized = result.error?.status === 401;
  const isRefreshRequest = getRequestUrl(args) === "auth/refresh";

  if (isUnauthorized && !isRefreshRequest) {
    const state = api.getState() as RootState;
    const { refreshToken, user } = state.auth;

    if (!refreshToken || !user) {
      await api.dispatch(performLogout());
      return result;
    }

    const refreshResult = await rawBaseQuery(
      {
        url: "auth/refresh",
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions,
    );

    const newAccessToken = (refreshResult.data as RefreshResponse | undefined)?.data
      ?.accessToken;

    if (newAccessToken) {
      await api.dispatch(
        persistCredentials({
          user,
          token: newAccessToken,
          refreshToken,
        }),
      );
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      await api.dispatch(performLogout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
