import * as SecureStore from "expo-secure-store";
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
import { EUserRoles } from "../types/userRoles";
import { decodeAuthUser } from "../utils/authToken";
import {
  getCachedTrainerNamesMap,
  saveCachedTrainerNamesMap,
} from "./trainingOfflineService";

//USERS
export const listUsersService = async (): Promise<IEmployeeResponse[]> => {
  const response = await api.get<IEmployeeResponse[]>("/api/v1/employees");
  return response.data;
};

export const createEmployeeService = async (
  payload: ICreateEmployeeRequest,
): Promise<UserProfileResponse | IEmployeeResponse> => {
  const roleEndpoints: Partial<Record<EmployeeType, string>> = {
    [EmployeeType.VETERINARIAN]: "/api/v1/employees/veterinarians",
    [EmployeeType.TRAINER]: "/api/v1/employees/trainers",
    [EmployeeType.COORDINATOR]: "/api/v1/employees/coordinators",
    [EmployeeType.COLLABORATOR]: "/api/v1/employees/collaborators",
  };

  const specificEndpoint = roleEndpoints[payload.type];
  if (specificEndpoint) {
    try {
      const response = await api.post<UserProfileResponse>(
        specificEndpoint,
        payload,
      );
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      if (status !== 404 && status !== 405) {
        throw error;
      }
    }
  }

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
  const token = await SecureStore.getItemAsync("userToken");
  const authUser = decodeAuthUser(token);

  const userSub = authUser?.registration || "";
  const decodedUserId = authUser?.userId || "";
  const decodedEmployeeId = authUser?.employeeId || "";
  const decodedEmail = authUser?.email || "";
  const roles = authUser?.roles || [];
  const currentRole = authUser?.type;

  const matchesLoggedUser = (u: any): boolean => {
    if (!u) return false;
    if (
      userSub &&
      typeof u.registration === "string" &&
      u.registration.toLowerCase() === userSub.toLowerCase()
    ) {
      return true;
    }
    if (decodedUserId && u.userId === decodedUserId) return true;
    if (
      decodedEmployeeId &&
      (u.employeeId === decodedEmployeeId ||
        u.collaboratorId === decodedEmployeeId ||
        u.trainerId === decodedEmployeeId)
    ) {
      return true;
    }
    if (
      decodedEmail &&
      typeof u.email === "string" &&
      u.email.toLowerCase() === decodedEmail.toLowerCase()
    ) {
      return true;
    }
    return false;
  };

  // 1. Se for Adestrador (Trainer)
  if (
    roles.includes(EUserRoles.ROLE_TRAINER) ||
    currentRole === EmployeeType.TRAINER
  ) {
    if (userSub) {
      try {
        const trainer = await getTrainerByRegistrationService(userSub);
        if (trainer && getEmployeeIdentifier(trainer)) {
          return trainer;
        }
      } catch (e) {}
    }

    try {
      const trainers = await getTrainersService();
      if (Array.isArray(trainers) && trainers.length > 0) {
        const match = trainers.find(matchesLoggedUser);
        if (match) return match;
        if (trainers.length === 1) return trainers[0];
      }
    } catch (e) {}
  }

  // 2. Se for Coordenador (Coordinator)
  if (
    roles.includes(EUserRoles.ROLE_COORDINATOR) ||
    currentRole === EmployeeType.COORDINATOR
  ) {
    if (userSub) {
      try {
        const coord = await getCoordinatorByRegistrationService(userSub);
        if (coord && getEmployeeIdentifier(coord)) {
          return coord;
        }
      } catch (e) {}
    }

    try {
      const coords = await getCoordinatorsService();
      if (Array.isArray(coords) && coords.length > 0) {
        const match = coords.find(matchesLoggedUser);
        if (match) return match;
      }
    } catch (e) {}
  }

  // 3. Se for Veterinário (Veterinarian)
  if (
    roles.includes(EUserRoles.ROLE_VETERINARIAN) ||
    currentRole === EmployeeType.VETERINARIAN
  ) {
    if (userSub) {
      try {
        const vet = await getVeterinarianByRegistrationService(userSub);
        if (vet && getEmployeeIdentifier(vet)) {
          return vet;
        }
      } catch (e) {}
    }

    try {
      const vets = await getVeterinariansService();
      if (Array.isArray(vets) && vets.length > 0) {
        const match = vets.find(matchesLoggedUser);
        if (match) return match;
      }
    } catch (e) {}
  }

  // 4. Se for Colaborador (Collaborator)
  if (
    roles.includes(EUserRoles.ROLE_COLLABORATOR) ||
    currentRole === EmployeeType.COLLABORATOR
  ) {
    if (userSub) {
      try {
        const collab = await getCollaboratorByRegistrationService(userSub);
        if (collab && getEmployeeIdentifier(collab)) {
          return collab;
        }
      } catch (e) {}
    }

    try {
      const collabs = await getCollaboratorsService();
      if (Array.isArray(collabs) && collabs.length > 0) {
        const match = collabs.find(matchesLoggedUser);
        if (match) return match;
      }
    } catch (e) {}
  }

  // 5. Fallback geral por lista de funcionários ou adestradores
  if (userSub) {
    try {
      const trainer = await getTrainerByRegistrationService(userSub);
      if (trainer && getEmployeeIdentifier(trainer)) {
        return trainer;
      }
    } catch (e) {}
  }

  try {
    const users = await listUsersService();
    if (Array.isArray(users) && users.length > 0) {
      const match = users.find(matchesLoggedUser);
      if (match) return match as UserProfileResponse;
    }
  } catch (e) {}

  try {
    const trainers = await getTrainersService();
    if (Array.isArray(trainers) && trainers.length > 0) {
      const match = trainers.find(matchesLoggedUser);
      if (match) return match;
    }
  } catch (e) {}

  if (authUser && (decodedEmployeeId || decodedUserId)) {
    return {
      employeeId: decodedEmployeeId,
      userId: decodedUserId,
      registration: userSub,
      email: decodedEmail,
      name: authUser.name || "Usuário",
      phone: authUser.phone || "",
      shift: authUser.shift || "MORNING",
      type: authUser.type || EmployeeType.TRAINER,
      areaOfExpertise: authUser.areaOfExpertise || "",
    };
  }

  throw new Error("Não foi possível identificar o perfil do usuário autenticado.");
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

export const resolveTrainerNameFromMap = (
  trainerId: string | undefined | null,
  map: Record<string, string>,
  fallbackName?: string,
): string | undefined => {
  if (
    trainerId &&
    trainerId !== "00000000-0000-0000-0000-000000000000" &&
    map[trainerId.toLowerCase()]
  ) {
    return map[trainerId.toLowerCase()];
  }
  if (fallbackName && fallbackName.trim()) {
    return fallbackName.trim();
  }
  return undefined;
};

/**
 * Busca e armazena em cache um mapa de IDs (employeeId, userId, trainerId) para nomes de treinadores/funcionários.
 */
export const getTrainerNamesMapService = async (
  extraTrainerIds?: (string | undefined | null)[],
): Promise<Record<string, string>> => {
  const cachedMap = await getCachedTrainerNamesMap();
  const map: Record<string, string> = { ...cachedMap };

  const registerUser = (u: any) => {
    if (!u || typeof u.name !== "string" || !u.name.trim()) return;
    const cleanName = u.name.trim();
    const candidates = [
      u.employeeId,
      u.trainerId,
      u.collaboratorId,
      u.veterinarianId,
      u.coordinatorId,
      u.id,
      u.ID,
      u.userId,
      getEmployeeIdentifier(u),
    ];
    candidates.forEach((id) => {
      if (
        typeof id === "string" &&
        id.trim() &&
        id !== "00000000-0000-0000-0000-000000000000"
      ) {
        map[id.trim().toLowerCase()] = cleanName;
      }
    });
  };

  try {
    const [trainersRes, usersRes, coordsRes] = await Promise.allSettled([
      getTrainersService(),
      listUsersService(),
      getCoordinatorsService(),
    ]);

    if (trainersRes.status === "fulfilled" && Array.isArray(trainersRes.value)) {
      trainersRes.value.forEach(registerUser);
    }
    if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value)) {
      usersRes.value.forEach(registerUser);
    }
    if (coordsRes.status === "fulfilled" && Array.isArray(coordsRes.value)) {
      coordsRes.value.forEach(registerUser);
    }
  } catch (e) {}

  try {
    const loggedProfile = await getLoggedUserProfileService();
    registerUser(loggedProfile);
  } catch (e) {}

  if (Array.isArray(extraTrainerIds) && extraTrainerIds.length > 0) {
    const missingIds = Array.from(
      new Set(
        extraTrainerIds
          .filter(
            (id): id is string =>
              typeof id === "string" &&
              id.trim().length > 0 &&
              id !== "00000000-0000-0000-0000-000000000000",
          )
          .map((id) => id.trim()),
      ),
    ).filter((id) => !map[id.toLowerCase()]);

    await Promise.allSettled(
      missingIds.map(async (id) => {
        try {
          const trainer = await getTrainerByIdService(id);
          if (trainer) {
            registerUser({ ...trainer, trainerId: id });
            return;
          }
        } catch (e) {}
        try {
          const emp = await getEmployeeByIdService(id);
          if (emp) {
            registerUser({ ...emp, employeeId: id });
          }
        } catch (e) {}
      }),
    );
  }

  await saveCachedTrainerNamesMap(map);
  return map;
};
