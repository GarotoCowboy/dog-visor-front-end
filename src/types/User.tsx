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