export enum EmployeeType {
  VETERINARIAN = "VETERINARIAN",
  COORDINATOR = "COORDINATOR",
  TRAINER = "TRAINER",
  COLLABORATOR = "COLLABORATOR",
}

export enum EmployeeShift {
  MORNING = "MORNING",
  AFTERNOON = "AFTERNOON",
  NIGHT = "NIGHT",
}

export const EmployeeTypeLabel: Record<EmployeeType, string> = {
  [EmployeeType.VETERINARIAN]: "Veterinário(a)",
  [EmployeeType.COORDINATOR]: "Coordenador(a)",
  [EmployeeType.TRAINER]: "Adestrador(a)",
  [EmployeeType.COLLABORATOR]: "Colaborador(a)",
};

export const EmployeeShiftLabel: Record<string, string> = {
  MORNING: "Manhã",
  AFTERNOON: "Tarde",
  NIGHT: "Noite",
};

export interface ICollaboratorResponse {
  collaboratorId: string;
  userId: string;
  registration: string;
  email: string;
  name: string;
  phone: string;
  type: EmployeeType;
  shift: string | EmployeeShift;
  active?: boolean;
}

export interface ICoordinatorResponse {
  employeeId: string;
  userId: string;
  registration: string;
  email: string;
  name: string;
  phone: string;
  shift: string | EmployeeShift;
  type: EmployeeType;
  active?: boolean;
}

export interface ITrainerResponse {
  employeeId: string;
  userId: string;
  registration: string;
  email: string;
  name: string;
  phone: string;
  shift: string | EmployeeShift;
  type: EmployeeType;
  areaOfExpertise: string;
  active?: boolean;
}

export interface IVeterinarianResponse {
  employeeId: string;
  userId: string;
  registration: string;
  email: string;
  name: string;
  phone: string;
  shift: string | EmployeeShift;
  type: EmployeeType;
  crmv: string;
  areaOfExpertise: string;
  active?: boolean;
}

export type UserProfileResponse =
  | ICollaboratorResponse
  | ICoordinatorResponse
  | ITrainerResponse
  | IVeterinarianResponse;

export interface IEmployeeResponse {
  employeeId: string;
  userId: string;
  registration: string;
  email: string;
  name: string;
  phone: string;
  shift: EmployeeShift | string;
  type: EmployeeType;
  active?: boolean;
}

export interface ICreateEmployeeRequest {
  name: string;
  email: string;
  phone: string;
  registration: string;
  shift: EmployeeShift;
  type: EmployeeType;
}


// --- Helpers tipados para a união de perfis (evitam casts `as any`) ---
type AnyEmployee = UserProfileResponse | IEmployeeResponse;

/** Identificador do funcionário: employeeId, collaboratorId ou userId (nessa ordem). */
export const getEmployeeIdentifier = (
  user?: AnyEmployee | null,
): string | undefined => {
  if (!user) return undefined;
  if ("employeeId" in user && user.employeeId) return user.employeeId;
  if ("collaboratorId" in user && user.collaboratorId) return user.collaboratorId;
  return user.userId || undefined;
};

export const getUserCrmv = (user?: AnyEmployee | null): string | undefined =>
  user && "crmv" in user ? user.crmv : undefined;

export const getUserAreaOfExpertise = (
  user?: AnyEmployee | null,
): string | undefined =>
  user && "areaOfExpertise" in user ? user.areaOfExpertise : undefined;

export const isSameUser = (a: AnyEmployee, b: AnyEmployee): boolean => {
  if (a.registration && a.registration === b.registration) return true;
  const idA = getEmployeeIdentifier(a);
  return Boolean(idA) && idA === getEmployeeIdentifier(b);
};