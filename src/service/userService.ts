import api from "./apiClient";
import {
  EmployeeType,
  ICollaboratorResponse,
  ICoordinatorResponse,
  ICreateEmployeeRequest,
  IEmployeeResponse,
  ITrainerResponse,
  IVeterinarianResponse,
  UserProfileResponse,
  getEmployeeIdentifier,
} from "../types/User";

//USERS
export const listUsersService = async (): Promise<IEmployeeResponse[]> => {
  const response = await api.get<IEmployeeResponse[]>("/api/v1/employees");
  return response.data;
};

export const createEmployeeService = async (
  payload: ICreateEmployeeRequest,
): Promise<IEmployeeResponse> => {
  const response = await api.post<IEmployeeResponse>(
    "/api/v1/employees",
    payload,
  );
  return response.data;
};

export const getUsersCountService = async (): Promise<number> => {
  const employees = await listUsersService();
  return Array.isArray(employees)
    ? employees.filter((emp) => emp.active !== false).length
    : 0;
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

export const deleteEmployeeService = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/employees/${id}`);
};

export const deleteCollaboratorService = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/employees/collaborators/${id}`);
};

export const deleteTrainerService = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/employees/trainers/${id}`);
};

export const deleteVeterinarianService = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/employees/veterinarians/${id}`);
};

export const deleteCoordinatorService = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/employees/coordinators/${id}`);
};

export const inactivateUserService = async (
  user: UserProfileResponse,
): Promise<void> => {
  const genericId = getEmployeeIdentifier(user);

  if (user.type === EmployeeType.COLLABORATOR && "collaboratorId" in user) {
    try {
      await deleteCollaboratorService(user.collaboratorId);
      return;
    } catch (e) {
      // fallback
    }
  } else if (user.type === EmployeeType.VETERINARIAN && "employeeId" in user) {
    try {
      await deleteVeterinarianService(user.employeeId);
      return;
    } catch (e) {
      // fallback
    }
  } else if (user.type === EmployeeType.TRAINER && "employeeId" in user) {
    try {
      await deleteTrainerService(user.employeeId);
      return;
    } catch (e) {
      // fallback
    }
  } else if (user.type === EmployeeType.COORDINATOR && "employeeId" in user) {
    try {
      await deleteCoordinatorService(user.employeeId);
      return;
    } catch (e) {
      // fallback
    }
  }

  if (genericId) {
    await deleteEmployeeService(genericId);
  } else {
    throw new Error("Identificador do usuário não encontrado para inativação.");
  }
};
