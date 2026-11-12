import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./apiClient";
import { getDogsService } from "./dogService";
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
const FEEDING_PLANS_CACHE_KEY = "@dogvisor:feeding_plans_cache";
let memoryPlansCache: IFeedingPlanResponse[] = [];

const extractArrayFromResponse = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.content)) return data.content;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.plans)) return data.plans;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.results)) return data.results;
  }
  return [];
};

const normalizeFeedingPlan = (raw: any): IFeedingPlanResponse => {
  if (!raw || typeof raw !== "object") return raw;
  const resolvedId =
    raw.id ?? raw.ID ?? raw.feedingPlanId ?? raw.planId ?? "";
  const resolvedDogId =
    raw.dogId ??
    raw.dogsId ??
    raw.dog_id ??
    raw.dogs_id ??
    raw.dog?.id ??
    raw.dog?.ID ??
    "";
  const resolvedRationId =
    raw.rationId ??
    raw.ration_id ??
    raw.ration?.id ??
    raw.ration?.ID ??
    "";
  const resolvedRationName =
    raw.rationName ??
    raw.ration_name ??
    raw.ration?.name ??
    "";
  const resolvedName =
    raw.name ??
    raw.feedingPlanName ??
    raw.planName ??
    "Plano Alimentar Regular";
  const resolvedMealQty = Number(
    raw.mealQuantityInGrams ??
      raw.meal_quantity_in_grams ??
      raw.mealQuantity ??
      raw.quantityInGrams ??
      (raw.dailyQuantityKg ? (Number(raw.dailyQuantityKg) * 1000) / 2 : 175),
  );

  return {
    ...raw,
    id: String(resolvedId),
    dogId: String(resolvedDogId),
    rationId: String(resolvedRationId),
    rationName: String(resolvedRationName),
    rationType:
      raw.rationType ?? raw.ration_type ?? raw.ration?.rationType ?? "",
    name: String(resolvedName),
    mealQuantityInGrams:
      !isNaN(resolvedMealQty) && resolvedMealQty > 0 ? resolvedMealQty : 175,
    active:
      raw.active !== undefined && raw.active !== null
        ? Boolean(raw.active)
        : true,
  };
};

const readCachedPlans = async (): Promise<IFeedingPlanResponse[]> => {
  if (memoryPlansCache.length > 0) return memoryPlansCache;
  try {
    const raw = await AsyncStorage.getItem(FEEDING_PLANS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryPlansCache = parsed.map(normalizeFeedingPlan);
      return memoryPlansCache;
    }
  } catch {
    // ignore storage errors
  }
  return [];
};

const writeCachedPlans = async (plans: IFeedingPlanResponse[]): Promise<void> => {
  memoryPlansCache = plans;
  try {
    await AsyncStorage.setItem(FEEDING_PLANS_CACHE_KEY, JSON.stringify(plans));
  } catch {
    // ignore storage errors
  }
};

const upsertCachedPlan = async (
  plan: IFeedingPlanResponse,
): Promise<IFeedingPlanResponse> => {
  const normalized = normalizeFeedingPlan(plan);
  const current = await readCachedPlans();
  const filtered = current.filter(
    (p) =>
      String(p.id) !== String(normalized.id) &&
      String(p.dogId).toLowerCase() !== String(normalized.dogId).toLowerCase(),
  );
  const next = [...filtered, normalized];
  await writeCachedPlans(next);
  return normalized;
};

const collectFallbackPlans = async (): Promise<IFeedingPlanResponse[]> => {
  const cached = await readCachedPlans();
  const mergedByDog = new Map<string, IFeedingPlanResponse>();

  cached.forEach((p) => {
    if (p.dogId) mergedByDog.set(String(p.dogId).toLowerCase(), p);
  });

  // 1. Tenta extrair planos a partir das estimativas de consumo das rações (/rations/estimates)
  try {
    const estimates = await getAllRationEstimates();
    if (Array.isArray(estimates)) {
      for (const est of estimates) {
        if (Array.isArray(est.dogConsumptions)) {
          for (const dc of est.dogConsumptions) {
            if (!dc.dogId) continue;
            let fullPlan: IFeedingPlanResponse | null = null;
            if (dc.feedingPlanId) {
              try {
                fullPlan = await getFeedingPlanByIdService(dc.feedingPlanId);
              } catch {
                // fallback para dados resumidos da estimativa
              }
            }
            const planObj =
              fullPlan ||
              normalizeFeedingPlan({
                id: dc.feedingPlanId,
                dogId: dc.dogId,
                rationId: est.rationId,
                rationName: est.rationName,
                rationType: est.rationType,
                name: dc.feedingPlanName || "Plano Alimentar Regular",
                dailyQuantityKg: dc.dailyQuantityKg,
                active: true,
              });
            mergedByDog.set(String(planObj.dogId).toLowerCase(), planObj);
          }
        }
      }
    }
  } catch {
    // ignora falha de estimativas
  }

  // 2. Tenta buscar por cão individualmente (/plans/dog/{dogId})
  try {
    const dogs = await getDogsService();
    const perDogResults = await Promise.allSettled(
      dogs.map((d) => getFeedingPlansByDogIdService(d.ID)),
    );
    perDogResults.forEach((res) => {
      if (res.status === "fulfilled" && Array.isArray(res.value)) {
        res.value.forEach((p) => {
          const norm = normalizeFeedingPlan(p);
          if (norm.dogId) {
            mergedByDog.set(String(norm.dogId).toLowerCase(), norm);
          }
        });
      }
    });
  } catch {
    // ignora erro
  }

  const merged = Array.from(mergedByDog.values());
  if (merged.length > 0) {
    await writeCachedPlans(merged);
  }
  return merged;
};

export const listFeedingPlansService = async (): Promise<IFeedingPlanResponse[]> => {
  try {
    const response = await api.get<any>("/api/v1/dogfeeding/plans");
    const rawList = extractArrayFromResponse(response.data);
    const list = rawList.map(normalizeFeedingPlan);
    if (list.length > 0) {
      await writeCachedPlans(list);
      return list;
    }
    return await collectFallbackPlans();
  } catch (err) {
    console.log("Fallback em listFeedingPlansService:", err);
    return await collectFallbackPlans();
  }
};

export const getFeedingPlanByIdService = async (
  id: string,
): Promise<IFeedingPlanResponse> => {
  const response = await api.get<IFeedingPlanResponse>(
    `/api/v1/dogfeeding/plans/${id}`,
  );
  return normalizeFeedingPlan(response.data);
};

export const getFeedingPlansByDogIdService = async (
  dogId: string,
): Promise<IFeedingPlanResponse[]> => {
  const response = await api.get<any>(
    `/api/v1/dogfeeding/plans/dog/${dogId}`,
  );
  const rawList = extractArrayFromResponse(response.data);
  return rawList.map((item) =>
    normalizeFeedingPlan({
      ...item,
      dogId: item?.dogId ?? dogId,
    }),
  );
};

export const createFeedingPlanService = async (
  dto: ICreateFeedingPlanRequest,
): Promise<IFeedingPlanResponse> => {
  const response = await api.post<IFeedingPlanResponse>(
    "/api/v1/dogfeeding/plans",
    dto,
  );
  const created = normalizeFeedingPlan({
    ...dto,
    ...response.data,
    dogId: response.data?.dogId ?? dto.dogId,
    rationId: response.data?.rationId ?? dto.rationId,
  });
  return upsertCachedPlan(created);
};

export const updateFeedingPlanService = async (
  id: string,
  dto: IUpdateFeedingPlanRequest,
): Promise<IFeedingPlanResponse> => {
  const response = await api.patch<IFeedingPlanResponse>(
    `/api/v1/dogfeeding/plans/${id}`,
    dto,
  );
  const updated = normalizeFeedingPlan({
    ...dto,
    ...response.data,
    id: response.data?.id ?? id,
  });
  return upsertCachedPlan(updated);
};

export const deleteFeedingPlanService = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/dogfeeding/plans/${id}`);
  const current = await readCachedPlans();
  await writeCachedPlans(current.filter((p) => String(p.id) !== String(id)));
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
