import axios from "axios";
import { IAuthenticationDTO } from "../types/Authentication";
import { ADDRESS } from "./backEndAddress";
import * as SecureStore from "expo-secure-store";
import { ICreateDogRequest, IDogResponse } from "../types/Dog";
import { jwtDecode } from "jwt-decode";
import { ICreateDogConsultationRequest } from "../types/DogHealth";
import {
  ICreateRationRequest,
  IDecreaseRationStockRequest,
  IIncreaseRationStockRequest,
  IRationAlertResponse,
  IRationConsumptionEstimateResponse,
  IRationResponse,
  ISearchRationParams,
  IUpdateRationRequest,
} from "../types/Ration";
import {
  ICollaboratorResponse,
  ICoordinatorResponse,
  IEmployeeResponse,
  ITrainerResponse,
  IVeterinarianResponse,
  UserProfileResponse,
} from "../types/User";
import {
  INotificationCreateRequest,
  INotificationResponse,
  PageResponse,
} from "../types/Notification";
import {
  ICreateMedicationRequest,
  IMedicationResponse,
} from "../types/Medication";

interface JwtPayload {
  exp?: number;
}

let unauthorizedHandler: (() => Promise<void>) | null = null;

export const setUnauthorizedHandler = (
  handler: (() => Promise<void>) | null,
) => {
  unauthorizedHandler = handler;
};

const isTokenExpired = (token: string) => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (!decoded.exp) {
      return false;
    }

    return decoded.exp <= Date.now() / 1000;
  } catch (error) {
    console.log("Erro ao decodificar token", error);
    return true;
  }
};

const handleUnauthorized = async () => {
  await SecureStore.deleteItemAsync("userToken");
  await unauthorizedHandler?.();
};

const api = axios.create({
  timeout: 5000,
  baseURL: ADDRESS,
});
export default api;

api.interceptors.request.use(
  async (config) => {
    try {
      // Busca o token JWT salvo no dispositivo pelo AuthContext
      const token = await SecureStore.getItemAsync("userToken");
      // Se o token existir, injeta ele no cabeçalho da requisição
      if (token) {
        if (isTokenExpired(token)) {
          await handleUnauthorized();
          return Promise.reject(new Error("Token expirado"));
        }

        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Erro ao buscar o token no SecureStore", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await handleUnauthorized();
    }

    return Promise.reject(error);
  },
);

export const loginService = async (credentials: IAuthenticationDTO) => {
  const response = await api.post("api/v1/auth/login", credentials);
  return response.data;
};

//USERS
export const listUsersService = async (): Promise<IEmployeeResponse[]> => {
  const response = await api.get<IEmployeeResponse[]>("/api/v1/employees");
  return response.data;
};

export const getUsersCountService = async (): Promise<number> => {
  const response = await api.get<number>("/api/v1/employees/count");
  return response.data;
};

export const getEmployeeByIdService = async (
  id: string,
): Promise<UserProfileResponse> => {
  const response = await api.get<UserProfileResponse>(`/api/v1/employees/${id}`);
  return response.data;
};

export const getLoggedUserProfileService = async (): Promise<UserProfileResponse> => {
  const response = await api.get<UserProfileResponse>("/api/v1/employees/me");
  return response.data;
};

export const getVeterinariansService = async (): Promise<IVeterinarianResponse[]> => {
  const response = await api.get<IVeterinarianResponse[]>("/api/v1/employees/veterinarians");
  return response.data;
};

export const getVeterinarianByIdService = async (
  id: string,
): Promise<IVeterinarianResponse> => {
  const response = await api.get<IVeterinarianResponse>(`/api/v1/employees/veterinarians/${id}`);
  return response.data;
};

export const getVeterinarianByRegistrationService = async (
  registration: string,
): Promise<IVeterinarianResponse> => {
  const response = await api.get<IVeterinarianResponse>(
    `/api/v1/employees/veterinarians/registration/${registration}`,
  );
  return response.data;
};

export const getTrainersService = async (): Promise<ITrainerResponse[]> => {
  const response = await api.get<ITrainerResponse[]>("/api/v1/employees/trainers");
  return response.data;
};

export const getTrainerByIdService = async (
  id: string,
): Promise<ITrainerResponse> => {
  const response = await api.get<ITrainerResponse>(`/api/v1/employees/trainers/${id}`);
  return response.data;
};

export const getTrainerByRegistrationService = async (
  registration: string,
): Promise<ITrainerResponse> => {
  const response = await api.get<ITrainerResponse>(
    `/api/v1/employees/trainers/registration/${registration}`,
  );
  return response.data;
};

export const getCoordinatorsService = async (): Promise<ICoordinatorResponse[]> => {
  const response = await api.get<ICoordinatorResponse[]>("/api/v1/employees/coordinators");
  return response.data;
};

export const getCoordinatorByIdService = async (
  id: string,
): Promise<ICoordinatorResponse> => {
  const response = await api.get<ICoordinatorResponse>(`/api/v1/employees/coordinators/${id}`);
  return response.data;
};

export const getCoordinatorByRegistrationService = async (
  registration: string,
): Promise<ICoordinatorResponse> => {
  const response = await api.get<ICoordinatorResponse>(
    `/api/v1/employees/coordinators/registration/${registration}`,
  );
  return response.data;
};

export const getCollaboratorsService = async (): Promise<ICollaboratorResponse[]> => {
  const response = await api.get<ICollaboratorResponse[]>("/api/v1/employees/collaborators");
  return response.data;
};

export const getCollaboratorByIdService = async (
  id: string,
): Promise<ICollaboratorResponse> => {
  const response = await api.get<ICollaboratorResponse>(`/api/v1/employees/collaborators/${id}`);
  return response.data;
};

export const getCollaboratorByRegistrationService = async (
  registration: string,
): Promise<ICollaboratorResponse> => {
  const response = await api.get<ICollaboratorResponse>(
    `/api/v1/employees/collaborators/registration/${registration}`,
  );
  return response.data;
};

// NOTIFICATIONS & EVENTS
export const createNotificationService = async (
  dto: INotificationCreateRequest,
): Promise<INotificationResponse> => {
  const response = await api.post<INotificationResponse>(
    "/api/v1/dogNotification/notifications",
    dto,
  );
  return response.data;
};

export const getNotificationsService = async (
  page: number = 0,
  size: number = 50,
  isCompleted?: boolean,
): Promise<INotificationResponse[]> => {
  const params: Record<string, any> = { page, size };
  if (isCompleted !== undefined) {
    params.isCompleted = isCompleted;
  }

  const response = await api.get<
    PageResponse<INotificationResponse> | INotificationResponse[]
  >("/api/v1/dogNotification/notifications", { params });

  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && Array.isArray((response.data as any).content)) {
    return (response.data as any).content;
  }
  return [];
};

export const getPendingNotificationsService = async (
  page: number = 0,
  size: number = 50,
): Promise<INotificationResponse[]> => {
  const response = await api.get<
    PageResponse<INotificationResponse> | INotificationResponse[]
  >("/api/v1/dogNotification/notifications/pending", {
    params: { page, size },
  });

  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && Array.isArray((response.data as any).content)) {
    return (response.data as any).content;
  }
  return [];
};

export const getCompletedNotificationsService = async (
  page: number = 0,
  size: number = 50,
): Promise<INotificationResponse[]> => {
  const response = await api.get<
    PageResponse<INotificationResponse> | INotificationResponse[]
  >("/api/v1/dogNotification/notifications/completed", {
    params: { page, size },
  });

  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && Array.isArray((response.data as any).content)) {
    return (response.data as any).content;
  }
  return [];
};

export const toggleNotificationCompletedService = async (
  id: string,
): Promise<INotificationResponse> => {
  const response = await api.patch<INotificationResponse>(
    "/api/v1/dogNotification/notifications/toggle",
    {
      id,
      notificationId: id,
      taskId: id,
      completed: true,
    },
  );
  return response.data;
};

// MEDICATIONS (DogHealth Medication)
export const createMedicationService = async (
  dto: ICreateMedicationRequest,
): Promise<IMedicationResponse> => {
  const response = await api.post<IMedicationResponse>(
    "/api/v1/doghealth/medication",
    dto,
  );
  return response.data;
};

export const getMedicationByIdService = async (
  id: string,
): Promise<IMedicationResponse> => {
  const response = await api.get<IMedicationResponse>(
    `/api/v1/doghealth/medication/${id}`,
  );
  return response.data;
};

export const listMedicationsService = async (): Promise<
  IMedicationResponse[]
> => {
  const response = await api.get<IMedicationResponse[]>(
    "/api/v1/doghealth/medication",
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const deleteMedicationService = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/doghealth/medication/${id}`);
};






//DOGS
export const getDogsService = async ():Promise<IDogResponse> => {
  const response = await api.get("api/v1/dogs");
  return response.data;
};
export const listDogsService = async ():Promise<IDogResponse[]> => {
  const response = await api.get<IDogResponse[]>("api/v1/dogs");
  return response.data;
};

export const getDogsCountService = async (): Promise<number> => {
  const response = await api.get<number>("/api/v1/dogs/count");
  return response.data;
};


export const getDogsByIdService = async (id: string) => {
  const response = await api.get("api/v1/dogs/${id}");
  return response.data;
};

export const postDogService = async (dogData: ICreateDogRequest):Promise<IDogResponse> => {
  const response = await api.post("api/v1/dogs", dogData);
  return response.data;
};

//DOG HEALTH

export const postDogConsultation = async (
  consultationData: ICreateDogConsultationRequest,
) => {
  const response = await api.post(
    "/api/v1/doghealth/consultation",
    consultationData,
    { timeout: 20000 },
  );
  return response.data;
};

//DOG FEEDING
export const postDogRation = async (
  rationData: ICreateRationRequest,
): Promise<IRationResponse> => {
  const response = await api.post<IRationResponse>(
    "/api/v1/dogfeeding/rations",
    rationData,
    { timeout: 20000 },
  );
  return response.data;
};

export const getDogRation = async (): Promise<IRationResponse[]> => {
  const response = await api.get<IRationResponse[]>("/api/v1/dogfeeding/rations");
  return response.data;
};

export const getAllRationEstimates = async (): Promise<
  IRationConsumptionEstimateResponse[]
> => {
  const response = await api.get<IRationConsumptionEstimateResponse[]>(
    "/api/v1/dogfeeding/rations/estimates",
  );
  return response.data;
};

export const getDogRationById = async (
  id: string,
): Promise<IRationResponse> => {
  const response = await api.get<IRationResponse>(
    `/api/v1/dogfeeding/rations/${id}`,
  );
  return response.data;
};

export const getRationEstimateById = async (
  id: string,
): Promise<IRationConsumptionEstimateResponse> => {
  const response = await api.get<IRationConsumptionEstimateResponse>(
    `/api/v1/dogfeeding/rations/${id}/estimate`,
  );
  return response.data;
};

export const searchDogRations = async (
  params?: ISearchRationParams,
): Promise<IRationResponse[]> => {
  const response = await api.get<IRationResponse[]>(
    "/api/v1/dogfeeding/rations/search",
    { params },
  );
  return response.data;
};

export const getDogRationAlerts = async (): Promise<IRationAlertResponse[]> => {
  const response = await api.get<IRationAlertResponse[]>(
    "/api/v1/dogfeeding/rations/alerts",
  );
  return response.data;
};

export const updateDogRation = async (
  id: string,
  dto: IUpdateRationRequest,
): Promise<IRationResponse> => {
  const response = await api.patch<IRationResponse>(
    `/api/v1/dogfeeding/rations/${id}`,
    dto,
  );
  return response.data;
};

export const increaseDogRation = async (
  id: string,
  dto: IIncreaseRationStockRequest,
): Promise<IRationResponse> => {
  const response = await api.patch<IRationResponse>(
    `/api/v1/dogfeeding/rations/${id}/increase`,
    dto,
  );
  return response.data;
};

export const decreaseDogRation = async (
  id: string,
  dto: IDecreaseRationStockRequest,
): Promise<IRationResponse> => {
  const response = await api.patch<IRationResponse>(
    `/api/v1/dogfeeding/rations/${id}/decrease`,
    dto,
  );
  return response.data;
};

export const deleteDogRation = async (id: string): Promise<void> => {
  const response = await api.delete(`/api/v1/dogfeeding/rations/${id}`);
  return response.data;
};


