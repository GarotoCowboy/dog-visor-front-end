export enum ERATION_STATUS{
NORMAL = "NORMAL",
PUPPY = "PUPPY",
SPECIAL = "SPECIAL",
}

export const RationTypeLabel: Record<ERATION_STATUS,string>={
    [ERATION_STATUS.NORMAL]: "Normal",
    [ERATION_STATUS.PUPPY]: "Filhote",
    [ERATION_STATUS.SPECIAL]:"Especial",
}

export enum EStockStatus{
    HEALTH = "HEALTHY",
    LOW = "LOW",
    OUT_OF_STOCK = "OUT_OF_STOCK"
}

export interface ICreateRationRequest{
    name: string
  rationType: ERATION_STATUS | null;
  totalRationQuantity: number;
  currentRationQuantity :number;
  registrationDate : string;
}

export interface IIncreaseRationStockRequest {
  bagCount: number;
  weightPerBagKg: number;
}

export interface IDecreaseRationStockRequest {
  quantityKg: number;
}

export interface IUpdateRationRequest {
  name?: string;
  rationType?: ERATION_STATUS | null;
  totalRationQuantity?: number;
  currentRationQuantity?: number;
  registrationDate?: string;
}

export interface IRationResponse {
  id: string;
  name: string;
  rationType: ERATION_STATUS;
  totalRationQuantity: number;
  currentRationQuantity: number;
  registrationDate: string;
  stockStatus: EStockStatus;
}

export interface IRationConsumptionEstimateResponse {
  rationId?: string;
  rationName?: string;
  rationType?: ERATION_STATUS;
  currentStockKg?: number;
  dailyConsumptionKg?: number;
  estimatedDaysRemaining?: number;
  estimatedDepletionDate?: string;
}

export interface IRationAlertResponse {
  rationId?: string;
  rationName?: string;
  rationType?: ERATION_STATUS;
  currentStockKg?: number;
  stockStatus?: EStockStatus;
  message?: string;
}

export interface ISearchRationParams {
  rationType?: ERATION_STATUS;
  stockStatus?: EStockStatus;
}

