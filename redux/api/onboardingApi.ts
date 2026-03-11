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
    }),
    getDriverLicensePhotos: builder.query<DriverLicensePhotosResponse, void>({
      query: () => ({
        url: "driverOnboardingRead/license-photos",
        method: "GET",
      }),
    }),
    uploadDriverLicenseFront: builder.mutation<UploadDriverDocumentResponse, FormData>(
      {
        query: (body) => ({
          url: "driverOnboarding/license-front",
          method: "POST",
          body,
        }),
      },
    ),
    uploadDriverLicenseBack: builder.mutation<UploadDriverDocumentResponse, FormData>(
      {
        query: (body) => ({
          url: "driverOnboarding/license-back",
          method: "POST",
          body,
        }),
      },
    ),
  }),
});

export const {
  useGetDriverOnboardingStatusQuery,
  useGetDriverLicensePhotosQuery,
  useUploadDriverLicenseFrontMutation,
  useUploadDriverLicenseBackMutation,
} = onboardingApi;
