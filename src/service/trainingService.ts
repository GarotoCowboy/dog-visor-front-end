import api from "./apiClient";
import {
  IBehaviorTestResponse,
  ICreateBehaviorTestRequest,
  ICreateStage1Request,
  ICreateStage2Request,
  ICreateStage3Request,
  ICreateStage4Request,
  ICreateTrainingRequest,
  ICreateVolhardTestRequest,
  IStage1Response,
  IStage2Response,
  IStage3Response,
  IStage4Response,
  ITrainingReportResponse,
  ITrainingResponse,
  IUpdateBehaviorTestRequest,
  IUpdateTrainingRequest,
  IUpdateVolhardTestRequest,
  IVolhardTestResponse,
  TraningStatus,
} from "../types/Training";

// --- DOG TRAINING (TREINAMENTO & ETAPAS) ---

export const createTrainingService = async (
  dto: ICreateTrainingRequest,
): Promise<ITrainingResponse> => {
  const response = await api.post<ITrainingResponse>(
    "/api/v1/dogtraining/training",
    dto,
  );
  return response.data;
};

export const getTrainingByIdService = async (
  id: string,
): Promise<ITrainingResponse> => {
  const response = await api.get<ITrainingResponse>(
    `/api/v1/dogtraining/training/${id}`,
  );
  return response.data;
};

export const listTrainingsByDogIdService = async (
  dogId: string,
): Promise<ITrainingResponse[]> => {
  const response = await api.get<ITrainingResponse[]>(
    `/api/v1/dogtraining/training/dog/${dogId}`,
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const listTrainingsByTrainerIdService = async (
  trainerId: string,
): Promise<ITrainingResponse[]> => {
  const response = await api.get<ITrainingResponse[]>(
    `/api/v1/dogtraining/training/trainer/${trainerId}`,
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const updateTrainingService = async (
  id: string,
  dto: IUpdateTrainingRequest,
): Promise<ITrainingResponse> => {
  const response = await api.patch<ITrainingResponse>(
    `/api/v1/dogtraining/training/update/${id}`,
    dto,
  );
  return response.data;
};

export const deleteTrainingService = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/dogtraining/training/${id}`);
};

export const getTrainingReportService = async (
  trainingId: string,
): Promise<ITrainingReportResponse> => {
  const response = await api.get<ITrainingReportResponse>(
    `/api/v1/dogtraining/training/${trainingId}/report`,
  );
  return response.data;
};

export const getTrainingReportByDogIdService = async (
  dogId: string,
): Promise<ITrainingReportResponse> => {
  const response = await api.get<ITrainingReportResponse>(
    `/api/v1/dogtraining/training/dog/${dogId}/report`,
  );
  return response.data;
};

// --- STAGE 1 ---
export const createStage1Service = async (
  dto: ICreateStage1Request,
): Promise<IStage1Response> => {
  const response = await api.post<IStage1Response>(
    "/api/v1/dogtraining/stage1",
    dto,
  );
  return response.data;
};

export const listStage1ByTrainingIdService = async (
  trainingId: string,
): Promise<IStage1Response[]> => {
  const response = await api.get<IStage1Response[]>(
    `/api/v1/dogtraining/stage1/training/${trainingId}`,
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const finalizeStage1Service = async (
  id: string,
  status: TraningStatus,
): Promise<IStage1Response> => {
  const response = await api.patch<IStage1Response>(
    `/api/v1/dogtraining/stage1/finalize/${id}`,
    null,
    { params: { status } },
  );
  return response.data;
};

// --- STAGE 2 ---
export const createStage2Service = async (
  dto: ICreateStage2Request,
): Promise<IStage2Response> => {
  const response = await api.post<IStage2Response>(
    "/api/v1/dogtraining/stage2",
    dto,
  );
  return response.data;
};

export const listStage2ByTrainingIdService = async (
  trainingId: string,
): Promise<IStage2Response[]> => {
  const response = await api.get<IStage2Response[]>(
    `/api/v1/dogtraining/stage2/training/${trainingId}`,
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const finalizeStage2Service = async (
  id: string,
  status: TraningStatus,
): Promise<IStage2Response> => {
  const response = await api.patch<IStage2Response>(
    `/api/v1/dogtraining/stage2/finalize/${id}`,
    null,
    { params: { status } },
  );
  return response.data;
};

// --- STAGE 3 ---
export const createStage3Service = async (
  dto: ICreateStage3Request,
): Promise<IStage3Response> => {
  const response = await api.post<IStage3Response>(
    "/api/v1/dogtraining/stage3",
    dto,
  );
  return response.data;
};

export const listStage3ByTrainingIdService = async (
  trainingId: string,
): Promise<IStage3Response[]> => {
  const response = await api.get<IStage3Response[]>(
    `/api/v1/dogtraining/stage3/training/${trainingId}`,
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const finalizeStage3Service = async (
  id: string,
  status: TraningStatus,
): Promise<IStage3Response> => {
  const response = await api.patch<IStage3Response>(
    `/api/v1/dogtraining/stage3/finalize/${id}`,
    null,
    { params: { status } },
  );
  return response.data;
};

// --- STAGE 4 ---
export const createStage4Service = async (
  dto: ICreateStage4Request,
): Promise<IStage4Response> => {
  const response = await api.post<IStage4Response>(
    "/api/v1/dogtraining/stage4",
    dto,
  );
  return response.data;
};

export const listStage4ByTrainingIdService = async (
  trainingId: string,
): Promise<IStage4Response[]> => {
  const response = await api.get<IStage4Response[]>(
    `/api/v1/dogtraining/stage4/training/${trainingId}`,
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const finalizeStage4Service = async (
  id: string,
  status: TraningStatus,
): Promise<IStage4Response> => {
  const response = await api.patch<IStage4Response>(
    `/api/v1/dogtraining/stage4/finalize/${id}`,
    null,
    { params: { status } },
  );
  return response.data;
};

// --- BEHAVIOR TEST (TESTE COMPORTAMENTAL) ---

export const createBehaviorTestService = async (
  dto: ICreateBehaviorTestRequest,
): Promise<IBehaviorTestResponse> => {
  const response = await api.post<IBehaviorTestResponse>(
    "/api/v1/dogtraining/behavior",
    dto,
  );
  return response.data;
};

export const listBehaviorTestsService = async (): Promise<
  IBehaviorTestResponse[]
> => {
  const response = await api.get<IBehaviorTestResponse[]>(
    "/api/v1/dogtraining/behavior",
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getBehaviorTestByIdService = async (
  id: string,
): Promise<IBehaviorTestResponse> => {
  const response = await api.get<IBehaviorTestResponse>(
    `/api/v1/dogtraining/behavior/${id}`,
  );
  return response.data;
};

export const listBehaviorTestsByDogIdService = async (
  dogId: string,
): Promise<IBehaviorTestResponse[]> => {
  const response = await api.get<IBehaviorTestResponse[]>(
    `/api/v1/dogtraining/behavior/dog/${dogId}`,
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const listBehaviorTestsByTrainerIdService = async (
  trainerId: string,
): Promise<IBehaviorTestResponse[]> => {
  const response = await api.get<IBehaviorTestResponse[]>(
    `/api/v1/dogtraining/behavior/trainer/${trainerId}`,
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const updateBehaviorTestService = async (
  id: string,
  dto: IUpdateBehaviorTestRequest,
): Promise<IBehaviorTestResponse> => {
  const response = await api.patch<IBehaviorTestResponse>(
    `/api/v1/dogtraining/behavior/update/${id}`,
    dto,
  );
  return response.data;
};

export const deleteBehaviorTestService = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/dogtraining/behavior/${id}`);
};

// --- VOLHARD TEST (TESTE DE APTIDÃO VOLHARD) ---

export const createVolhardTestService = async (
  dto: ICreateVolhardTestRequest,
): Promise<IVolhardTestResponse> => {
  const response = await api.post<IVolhardTestResponse>(
    "/api/v1/dogtraining/volhard",
    dto,
  );
  return response.data;
};

export const listVolhardTestsService = async (): Promise<
  IVolhardTestResponse[]
> => {
  const response = await api.get<IVolhardTestResponse[]>(
    "/api/v1/dogtraining/volhard",
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getVolhardTestByIdService = async (
  id: string,
): Promise<IVolhardTestResponse> => {
  const response = await api.get<IVolhardTestResponse>(
    `/api/v1/dogtraining/volhard/${id}`,
  );
  return response.data;
};

export const listVolhardTestsByDogIdService = async (
  dogId: string,
): Promise<IVolhardTestResponse[]> => {
  const response = await api.get<IVolhardTestResponse[]>(
    `/api/v1/dogtraining/volhard/dog/${dogId}`,
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const listVolhardTestsByTrainerIdService = async (
  trainerId: string,
): Promise<IVolhardTestResponse[]> => {
  const response = await api.get<IVolhardTestResponse[]>(
    `/api/v1/dogtraining/volhard/trainer/${trainerId}`,
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const updateVolhardTestService = async (
  id: string,
  dto: IUpdateVolhardTestRequest,
): Promise<IVolhardTestResponse> => {
  const response = await api.patch<IVolhardTestResponse>(
    `/api/v1/dogtraining/volhard/update/${id}`,
    dto,
  );
  return response.data;
};

export const deleteVolhardTestService = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/dogtraining/volhard/${id}`);
};
