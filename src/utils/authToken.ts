import { jwtDecode } from "jwt-decode";
import { EmployeeType } from "../types/User";
import { EUserRoles } from "../types/userRoles";

/** Claims possíveis do JWT emitido pelo backend. */
interface IJwtClaims {
  sub?: string;
  id?: string;
  userId?: string;
  employeeId?: string;
  collaboratorId?: string;
  registration?: string;
  email?: string;
  name?: string;
  phone?: string;
  shift?: string;
  type?: EmployeeType;
  roles?: string[] | string;
  crmv?: string;
  CRMV?: string;
  areaOfExpertise?: string;
  area_of_expertise?: string;
  exp?: number;
}

/** Dados do usuário logado, decodificados uma única vez no AuthContext. */
export interface IAuthUser {
  registration: string;
  userId: string;
  employeeId: string;
  email: string;
  name: string;
  phone: string;
  shift: string;
  type: EmployeeType;
  crmv: string;
  areaOfExpertise: string;
  roles: string[];
}

export const getEmployeeTypeFromRoles = (roles: string[]): EmployeeType => {
  if (roles.includes(EUserRoles.ROLE_VETERINARIAN)) return EmployeeType.VETERINARIAN;
  if (roles.includes(EUserRoles.ROLE_COORDINATOR)) return EmployeeType.COORDINATOR;
  if (roles.includes(EUserRoles.ROLE_TRAINER)) return EmployeeType.TRAINER;
  return EmployeeType.COLLABORATOR;
};

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const { exp } = jwtDecode<IJwtClaims>(token);
    return exp ? exp <= Date.now() / 1000 : false;
  } catch (error) {
    console.log("Erro ao verificar validade do token", error);
    return true;
  }
};

export const decodeAuthUser = (token: string | null): IAuthUser | null => {
  if (!token) return null;
  try {
    const claims = jwtDecode<IJwtClaims>(token);
    const roles = Array.isArray(claims.roles)
      ? claims.roles
      : claims.roles
        ? [claims.roles]
        : [];
    return {
      registration: claims.registration ?? claims.sub ?? "",
      userId: claims.userId ?? claims.id ?? "",
      employeeId: claims.employeeId ?? claims.collaboratorId ?? "",
      email: claims.email ?? "",
      name: claims.name ?? "",
      phone: claims.phone ?? "",
      shift: claims.shift ?? "MORNING",
      type: claims.type ?? getEmployeeTypeFromRoles(roles),
      crmv: claims.crmv ?? claims.CRMV ?? "",
      areaOfExpertise: claims.areaOfExpertise ?? claims.area_of_expertise ?? "",
      roles,
    };
  } catch (error) {
    console.log("Erro ao decodificar token", error);
    return null;
  }
};

