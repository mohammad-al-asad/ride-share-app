import {
  ChangePasswordType,
  LoginType,
  RegisterType,
  ResetPasswordType,
  UpdateProfileInfoType,
} from "@/schemas/authSchema";
import { baseApi } from "./baseApi";

type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role?: string | null;
  phone?: string;
  profileImage?: string;
  emailVerifiedAt?: string | null;
  otp?: string;
};

type LoginResponse = {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
};

type RegisterPayload = RegisterType & {
  role?: "driver" | "rider";
};

type RegisterResponse = {
  success: boolean;
  data: {
    accessToken?: string;
    refreshToken?: string;
    user?: AuthUser;
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

type ForgotPasswordPayload = {
  email: string;
};

type ForgotPasswordResponse = {
  success: boolean;
  data: {
    message: string;
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
    user?: AuthUser;
    accessToken?: string;
    refreshToken?: string;
  };
};
type VerifyResetOtpResponse = {
  success: boolean;
  data: {
    resetToken?: string;
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

type UploadProfileImageResponse = {
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    role?: string;
    profileImage?: string;
  };
};

type UpdateProfileInfoResponse = {
  success: boolean;
  data: AuthUser;
};

type ChangePasswordPayload = Pick<
  ChangePasswordType,
  "currentPassword" | "newPassword"
>;

type ChangePasswordResponse = {
  success: boolean;
  data: {
    message: string;
  };
};

type ResetPasswordPayload = Pick<
  ResetPasswordType,
  "newPassword" | "confirmPassword"
> & {
  resetToken: string;
};

type ResetPasswordResponse = {
  success: boolean;
  data: {
    message: string;
  };
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterPayload>({
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
    forgotPassword: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordPayload
    >({
      query: (body) => ({
        url: "auth/forgot-password",
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
    verifyResetOtp: builder.mutation<VerifyResetOtpResponse, VerifyEmailPayload>({
      query: (body) => ({
        url: "auth/verify-reset-otp",
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
    uploadProfileImage: builder.mutation<UploadProfileImageResponse, FormData>({
      query: (body) => ({
        url: "auth/image-save",
        method: "PATCH",
        body,
      }),
    }),
    updateProfileInfo: builder.mutation<
      UpdateProfileInfoResponse,
      UpdateProfileInfoType
    >({
      query: (body) => ({
        url: "auth/profileInfo-update",
        method: "PATCH",
        body,
      }),
    }),
    changePassword: builder.mutation<
      ChangePasswordResponse,
      ChangePasswordPayload
    >({
      query: (body) => ({
        url: "auth/change-password",
        method: "PATCH",
        body,
      }),
    }),
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordPayload>({
      query: (body) => ({
        url: "auth/reset-password",
        method: "POST",
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
  useForgotPasswordMutation,
  useVerifyEmailMutation,
  useUpdateRoleMutation,
  useUploadProfileImageMutation,
  useUpdateProfileInfoMutation,
  useChangePasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
} = authApi;
