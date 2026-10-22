import api from "./apiClient";
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
  ICreateFeedingPlanRequest,
  IFeedingPlanResponse,
  IUpdateFeedingPlanRequest,
} from "../types/FeedingPlan";
import {
  IConsumptionReportParams,
  IConsumptionReportResponse,
  ICreateFeedingRequest,
  IFeedingResponse,
  ISearchFeedingParams,
  IUpdateFeedingRequest,
} from "../types/Feeding";

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

export const applyDailyConsumptionService = async (
  id: string,
): Promise<IRationResponse> => {
  const response = await api.post<IRationResponse>(
    `/api/v1/dogfeeding/rations/${id}/apply-daily-consumption`,
  );
  return response.data;
};

export const applyDailyConsumptionAllService = async (): Promise<
  IRationResponse[]
> => {
  const response = await api.post<IRationResponse[]>(
    `/api/v1/dogfeeding/rations/apply-daily-consumption`,
  );
  return Array.isArray(response.data) ? response.data : [];
};

// FEEDING PLANS
export const listFeedingPlansService = async (): Promise<IFeedingPlanResponse[]> => {
  const response = await api.get<IFeedingPlanResponse[]>("/api/v1/dogfeeding/plans");
  return Array.isArray(response.data) ? response.data : [];
};

export const getFeedingPlanByIdService = async (
  id: string,
): Promise<IFeedingPlanResponse> => {
  const response = await api.get<IFeedingPlanResponse>(
    `/api/v1/dogfeeding/plans/${id}`,
  );
  return response.data;
};

export const getFeedingPlansByDogIdService = async (
  dogId: string,
): Promise<IFeedingPlanResponse[]> => {
  const response = await api.get<IFeedingPlanResponse[]>(
    `/api/v1/dogfeeding/plans/dog/${dogId}`,
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const createFeedingPlanService = async (
  dto: ICreateFeedingPlanRequest,
): Promise<IFeedingPlanResponse> => {
  const response = await api.post<IFeedingPlanResponse>(
    "/api/v1/dogfeeding/plans",
    dto,
  );
  return response.data;
};

export const updateFeedingPlanService = async (
  id: string,
  dto: IUpdateFeedingPlanRequest,
): Promise<IFeedingPlanResponse> => {
  const response = await api.patch<IFeedingPlanResponse>(
    `/api/v1/dogfeeding/plans/${id}`,
    dto,
  );
  return response.data;
};

export const deleteFeedingPlanService = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/dogfeeding/plans/${id}`);
};

// --- DOG FEEDING (Alimentações Diárias & Relatórios) ---

export const createFeedingService = async (
  dto: ICreateFeedingRequest,
): Promise<IFeedingResponse> => {
  const response = await api.post<IFeedingResponse>(
    "/api/v1/dogfeeding/feedings",
    dto,
  );
  return response.data;
};

export const listFeedingsService = async (): Promise<IFeedingResponse[]> => {
  const response = await api.get<IFeedingResponse[]>("/api/v1/dogfeeding/feedings");
  return Array.isArray(response.data) ? response.data : [];
};

export const getFeedingByIdService = async (
  id: string,
): Promise<IFeedingResponse> => {
  const response = await api.get<IFeedingResponse>(
    `/api/v1/dogfeeding/feedings/${id}`,
  );
  return response.data;
};

export const listFeedingsByDogIdService = async (
  dogId: string,
): Promise<IFeedingResponse[]> => {
  const response = await api.get<IFeedingResponse[]>(
    `/api/v1/dogfeeding/feedings/dog/${dogId}`,
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const searchFeedingsService = async (
  params?: ISearchFeedingParams,
): Promise<IFeedingResponse[]> => {
  const response = await api.get<IFeedingResponse[]>(
    "/api/v1/dogfeeding/feedings/search",
    { params },
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getFeedingConsumptionReportService = async (
  params?: IConsumptionReportParams,
): Promise<IConsumptionReportResponse[]> => {
  const response = await api.get<IConsumptionReportResponse[]>(
    "/api/v1/dogfeeding/feedings/reports/consumption",
    { params },
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const updateFeedingService = async (
  id: string,
  dto: IUpdateFeedingRequest,
): Promise<IFeedingResponse> => {
  const response = await api.patch<IFeedingResponse>(
    `/api/v1/dogfeeding/feedings/${id}`,
    dto,
  );
  return response.data;
};

export const deleteFeedingService = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/dogfeeding/feedings/${id}`);
};
