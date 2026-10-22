import api from "./apiClient";
import {
  IAuthMessageResponse,
  IAuthenticationDTO,
  ICreateFirstCoordinatorRequest,
  IForgotPasswordRequest,
  IResetPasswordRequest,
} from "../types/Authentication";
import {
  ICoordinatorResponse,
} from "../types/User";

export const loginService = async (credentials: IAuthenticationDTO) => {
  const response = await api.post("api/v1/auth/login", credentials);
  return response.data;
};

export const forgotPasswordService = async (
  dto: IForgotPasswordRequest,
): Promise<IAuthMessageResponse> => {
  const response = await api.post<IAuthMessageResponse>(
    "/api/v1/auth/forgot-password",
    dto,
  );
  return response.data;
};

export const resetPasswordService = async (
  dto: IResetPasswordRequest,
): Promise<IAuthMessageResponse> => {
  const response = await api.post<IAuthMessageResponse>(
    "/api/v1/auth/reset-password",
    dto,
  );
  return response.data;
};

export const createFirstCoordinatorService = async (
  dto: ICreateFirstCoordinatorRequest,
): Promise<ICoordinatorResponse> => {
  const response = await api.post<ICoordinatorResponse>(
    "/api/v1/auth/first-coordinator",
    dto,
  );
  return response.data;
};
