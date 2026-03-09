import { LoginType } from "@/schemas/authSchema";
import { baseApi } from "./baseApi";

type LoginResponse = {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
      phone?: string;
      profileImage?: string;
    };
  };
};

type SendVerificationPayload = {
  email: string;
};

type SendVerificationResponse = {
  success: boolean;
  data: {
    message: string;
    otpForDev?: string;
  };
};

type VerifyEmailPayload = {
  email: string;
  otp: string;
};

type VerifyEmailResponse = {
  success: boolean;
  data: {
    message: string;
  };
};

type UpdateRolePayload = {
  role: "driver" | "rider";
  email: string;
};

type UpdateRoleResponse = {
  success: boolean;
  data: {
    message: string;
  };
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({
        url: "auth/register",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginType>({
      query: (body) => ({
        url: "auth/login",
        method: "POST",
        body,
      }),
    }),
    deleteAccount: builder.mutation({
      query: () => ({
        url: "auth/delete-account",
        method: "DELETE",
      }),
    }),
    sendVerification: builder.mutation<
      SendVerificationResponse,
      SendVerificationPayload
    >({
      query: (body) => ({
        url: "auth/send-verification",
        method: "POST",
        body,
      }),
    }),
    verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailPayload>({
      query: (body) => ({
        url: "auth/verify-email",
        method: "POST",
        body,
      }),
    }),
    updateRole: builder.mutation<UpdateRoleResponse, UpdateRolePayload>({
      query: (body) => ({
        url: "auth/editRole",
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useDeleteAccountMutation,
  useSendVerificationMutation,
  useVerifyEmailMutation,
  useUpdateRoleMutation,
} = authApi;
