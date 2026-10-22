import api from "./apiClient";
import {
  ICreateDogConsultationRequest,
  ICreateDogMassageRequest,
  ICreateDogReproductionRequest,
  ICreateDogWeightRequest,
  IDogMassageResponse,
  IDogReproductionResponse,
  IDogWeightResponse,
  IUpdateDogMassageRequest,
  IUpdateDogReproductionRequest,
  IUpdateDogWeightRequest,
} from "../types/DogHealth";
import {
  ICreateMedicationRequest,
  IMedicationResponse,
} from "../types/Medication";

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

// DOG REPRODUCTION (DogHealth Controle Reprodutivo / Cio)
export const createDogReproductionService = async (
  dto: ICreateDogReproductionRequest,
): Promise<IDogReproductionResponse> => {
  const response = await api.post<IDogReproductionResponse>(
    "/api/v1/doghealth/reproduction",
    dto,
  );
  return response.data;
};

export const listDogReproductionsService = async (): Promise<
  IDogReproductionResponse[]
> => {
  const response = await api.get<IDogReproductionResponse[]>(
    "/api/v1/doghealth/reproduction",
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getDogReproductionByIdService = async (
  id: string,
): Promise<IDogReproductionResponse> => {
  const response = await api.get<IDogReproductionResponse>(
    `/api/v1/doghealth/reproduction/${id}`,
  );
  return response.data;
};

export const getDogReproductionsByDogIdService = async (
  dogId: string,
): Promise<IDogReproductionResponse[]> => {
  const response = await api.get<IDogReproductionResponse[]>(
    `/api/v1/doghealth/reproduction/dog/${dogId}`,
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getLastDogReproductionByDogIdService = async (
  dogId: string,
): Promise<IDogReproductionResponse | null> => {
  try {
    const response = await api.get<IDogReproductionResponse>(
      `/api/v1/doghealth/reproduction/dog/${dogId}/last`,
    );
    return response.data || null;
  } catch (error: any) {
    if (error?.response?.status === 204 || error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const updateDogReproductionService = async (
  id: string,
  dto: IUpdateDogReproductionRequest,
): Promise<IDogReproductionResponse> => {
  const response = await api.patch<IDogReproductionResponse>(
    `/api/v1/doghealth/reproduction/update/${id}`,
    dto,
  );
  return response.data;
};

export const deleteDogReproductionService = async (
  id: string,
): Promise<void> => {
  await api.delete(`/api/v1/doghealth/reproduction/${id}`);
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

// DOG WEIGHT (Pesagens)
export const createDogWeightService = async (
  dto: ICreateDogWeightRequest,
): Promise<IDogWeightResponse> => {
  const response = await api.post<IDogWeightResponse>(
    "/api/v1/doghealth/weight",
    dto,
  );
  return response.data;
};

export const listDogWeightsByDogIdService = async (
  dogId: string,
): Promise<IDogWeightResponse[]> => {
  const response = await api.get<IDogWeightResponse[]>(
    `/api/v1/doghealth/weight/${dogId}`,
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const listDogWeightsByMonthService = async (
  dogId: string,
  month: number,
  year: number,
): Promise<IDogWeightResponse[]> => {
  const response = await api.get<IDogWeightResponse[]>(
    `/api/v1/doghealth/weight/${dogId}/month`,
    { params: { month, year } },
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const listDogWeightsByWeekService = async (
  dogId: string,
  date: string,
): Promise<IDogWeightResponse[]> => {
  const response = await api.get<IDogWeightResponse[]>(
    `/api/v1/doghealth/weight/${dogId}/week`,
    { params: { date } },
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getLastDogWeightService = async (
  dogId: string,
): Promise<IDogWeightResponse | null> => {
  try {
    const response = await api.get<IDogWeightResponse>(
      `/api/v1/doghealth/weight/${dogId}/lastWeight`,
    );
    return response.data || null;
  } catch (error: any) {
    if (error?.response?.status === 204 || error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const updateDogWeightService = async (
  id: string,
  dto: IUpdateDogWeightRequest,
): Promise<IDogWeightResponse> => {
  const response = await api.patch<IDogWeightResponse>(
    `/api/v1/doghealth/weight/update/${id}`,
    dto,
  );
  return response.data;
};

export const deleteDogWeightService = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/doghealth/weight/${id}`);
};

// DOG MASSAGE (Massagens)
export const createDogMassageService = async (
  dto: ICreateDogMassageRequest,
): Promise<IDogMassageResponse> => {
  const response = await api.post<IDogMassageResponse>(
    "/api/v1/doghealth/massage",
    dto,
  );
  return response.data;
};

export const listDogMassagesByDogIdService = async (
  dogId: string,
): Promise<IDogMassageResponse[]> => {
  const response = await api.get<IDogMassageResponse[]>(
    `/api/v1/doghealth/massage/${dogId}`,
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const listDogMassagesByMonthService = async (
  dogId: string,
  month: number,
  year: number,
): Promise<IDogMassageResponse[]> => {
  const response = await api.get<IDogMassageResponse[]>(
    `/api/v1/doghealth/massage/${dogId}/month`,
    { params: { month, year } },
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const listDogMassagesByWeekService = async (
  dogId: string,
  date: string,
): Promise<IDogMassageResponse[]> => {
  const response = await api.get<IDogMassageResponse[]>(
    `/api/v1/doghealth/massage/${dogId}/week`,
    { params: { date } },
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getLastDogMassageService = async (
  dogId: string,
): Promise<IDogMassageResponse | null> => {
  try {
    const response = await api.get<IDogMassageResponse>(
      `/api/v1/doghealth/massage/${dogId}/lastWeight`,
    );
    return response.data || null;
  } catch (error: any) {
    if (error?.response?.status === 204 || error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const updateDogMassageService = async (
  id: string,
  dto: IUpdateDogMassageRequest,
): Promise<IDogMassageResponse> => {
  const response = await api.patch<IDogMassageResponse>(
    `/api/v1/doghealth/massage/update/${id}`,
    dto,
  );
  return response.data;
};

export const deleteDogMassageService = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/doghealth/massage/${id}`);
};
