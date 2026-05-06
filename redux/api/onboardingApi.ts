import { baseApi } from "./baseApi";

type DriverOnboardingStatusItem = {
  key: string;
  title: string;
  status?: string;
};

type DriverOnboardingStatusResponse = {
  success: boolean;
  message: string;
  data: DriverOnboardingStatusItem[];
};

type DriverLicensePhotoDocument = {
  _id: string;
  fileUrl: string;
  rejectionReason?: string | null;
  status?: string;
};

type DriverLicensePhotosResponse = {
  success: boolean;
  message: string;
  data: {
    front?: DriverLicensePhotoDocument | null;
    back?: DriverLicensePhotoDocument | null;
  };
};

type DriverDocumentReadResponse = {
  success: boolean;
  message: string;
  data: {
    vehicleInsurance?: DriverLicensePhotoDocument | null;
  };
};

type DriverVehicleRegistrationReadResponse = {
  success: boolean;
  message: string;
  data: {
    vehicleRegistration?: DriverLicensePhotoDocument | null;
  };
};

type StripeInfoResponse = {
  success: boolean;
  message: string;
  data: {
    stripeAccountId?: string | null;
    stripeConnected?: boolean;
  };
};

type ConnectStripeRequest = {
  stripeAccountId: string;
};

type ConnectStripeResponse = {
  success: boolean;
  message: string;
  data?: {
    message?: string;
    stripeAccountId?: string;
    stripeConnected?: boolean;
  };
};

type VehicleInfo = {
  _id: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  seats: number;
  licensePlate: string;
  tier: string;
  isActive?: boolean;
  approved?: boolean;
  driverId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type VehicleInfoResponse = {
  success: boolean;
  message: string;
  data: {
    vehicle?: VehicleInfo | null;
  };
};

type SaveVehicleInfoRequest = {
  brand: string;
  model: string;
  year: number;
  type: string;
  tier: string;
  seats: number;
  licensePlate: string;
};

type SaveVehicleInfoResponse = {
  success: boolean;
  message: string;
  data?: {
    message?: string;
    vehicle?: VehicleInfo;
  };
};

type UploadDriverDocumentResponse = {
  success: boolean;
  message: string;
  data?: {
    message?: string;
    document?: {
      _id: string;
      type: string;
      fileUrl: string;
      status?: string;
    };
  };
};

export const onboardingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDriverOnboardingStatus: builder.query<
      DriverOnboardingStatusResponse,
      void
    >({
      query: () => ({
        url: "driverOnboarding/status",
        method: "GET",
      }),
      providesTags: ["DriverOnboarding"],
    }),
    getDriverLicensePhotos: builder.query<DriverLicensePhotosResponse, void>({
      query: () => ({
        url: "driverOnboardingRead/license-photos",
        method: "GET",
      }),
      providesTags: ["DriverOnboarding"],
    }),
    getVehicleInsurance: builder.query<DriverDocumentReadResponse, void>({
      query: () => ({
        url: "driverOnboardingRead/vehicle-insurance",
        method: "GET",
      }),
      providesTags: ["DriverOnboarding"],
    }),
    getVehicleRegistration: builder.query<
      DriverVehicleRegistrationReadResponse,
      void
    >({
      query: () => ({
        url: "driverOnboardingRead/vehicle-registration",
        method: "GET",
      }),
      providesTags: ["DriverOnboarding"],
    }),
    getStripeInfo: builder.query<StripeInfoResponse, void>({
      query: () => ({
        url: "driverOnboardingRead/stripe",
        method: "GET",
      }),
      providesTags: ["DriverOnboarding"],
    }),
    getVehicleInfo: builder.query<VehicleInfoResponse, void>({
      query: () => ({
        url: "driverOnboardingRead/vehicle-info",
        method: "GET",
      }),
      providesTags: ["DriverOnboarding"],
    }),
    uploadDriverLicenseFront: builder.mutation<UploadDriverDocumentResponse, FormData>(
      {
        query: (body) => ({
          url: "driverOnboarding/license-front",
          method: "POST",
          body,
        }),
        invalidatesTags: ["DriverOnboarding"],
      },
    ),
    uploadDriverLicenseBack: builder.mutation<UploadDriverDocumentResponse, FormData>(
      {
        query: (body) => ({
          url: "driverOnboarding/license-back",
          method: "POST",
          body,
        }),
        invalidatesTags: ["DriverOnboarding"],
      },
    ),
    uploadVehicleInsurance: builder.mutation<
      UploadDriverDocumentResponse,
      FormData
    >({
      query: (body) => ({
        url: "driverOnboarding/vehicle-insurance",
        method: "POST",
        body,
      }),
      invalidatesTags: ["DriverOnboarding"],
    }),
    uploadVehicleRegistration: builder.mutation<
      UploadDriverDocumentResponse,
      FormData
    >({
      query: (body) => ({
        url: "driverOnboarding/vehicle-registration",
        method: "POST",
        body,
      }),
      invalidatesTags: ["DriverOnboarding"],
    }),
    connectStripe: builder.mutation<ConnectStripeResponse, ConnectStripeRequest>({
      query: (body) => ({
        url: "driverOnboarding/connect-stripe",
        method: "POST",
        body,
      }),
      invalidatesTags: ["DriverOnboarding"],
    }),
    saveVehicleInfo: builder.mutation<
      SaveVehicleInfoResponse,
      SaveVehicleInfoRequest
    >({
      query: (body) => ({
        url: "driverOnboarding/vehicle",
        method: "POST",
        body,
      }),
      invalidatesTags: ["DriverOnboarding"],
    }),
  }),
});

export const {
  useGetDriverOnboardingStatusQuery,
  useGetDriverLicensePhotosQuery,
  useGetVehicleInsuranceQuery,
  useGetVehicleRegistrationQuery,
  useGetStripeInfoQuery,
  useGetVehicleInfoQuery,
  useUploadDriverLicenseFrontMutation,
  useUploadDriverLicenseBackMutation,
  useUploadVehicleInsuranceMutation,
  useUploadVehicleRegistrationMutation,
  useConnectStripeMutation,
  useSaveVehicleInfoMutation,
} = onboardingApi;
