


import { EmployeeShift } from "./User";

export interface IAuthenticationDTO {
  registration: string;
  password: string;
}

export interface IForgotPasswordRequest {
  registration: string;
}

export interface IResetPasswordRequest {
  registration: string;
  code: string;
  newPassword: string;
  confirmationPassword: string;
}

export interface ICreateFirstCoordinatorRequest {
  email: string;
  name: string;
  phone: string;
  registration: string;
  password: string;
  shift: EmployeeShift;
}

export interface IAuthMessageResponse {
  message: string;
}

