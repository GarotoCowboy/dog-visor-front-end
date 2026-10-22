import { MealType, MeasurementUnit } from "./FeedingPlan";

export interface ICreateFeedingItemRequest {
  rationId: string;
  quantityUsed: number;
  unit: MeasurementUnit;
}

export interface IUpdateFeedingItemRequest {
  rationId: string;
  quantityUsed: number;
  unit: MeasurementUnit;
}

export interface IFeedingItemResponse {
  rationId: string;
  rationName: string;
  rationType: string;
  quantityUsed: number;
  unit: MeasurementUnit;
}

export interface ICreateFeedingRequest {
  dogId: string;
  date: string; // YYYY-MM-DD
  feedingTime: string; // HH:mm:ss ou HH:mm
  mealType: MealType;
  items: ICreateFeedingItemRequest[];
  notes?: string;
  dogResponse?: string;
}

export interface IUpdateFeedingRequest {
  date?: string;
  feedingTime?: string;
  mealType?: MealType;
  items?: IUpdateFeedingItemRequest[];
  notes?: string;
  dogResponse?: string;
}

export interface IFeedingResponse {
  id: string;
  dogId: string;
  date: string;
  feedingTime: string;
  mealType: MealType;
  items: IFeedingItemResponse[];
  totalQuantity: number;
  notes?: string;
  dogResponse?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ISearchFeedingParams {
  dogId?: string;
  startDate?: string;
  endDate?: string;
  mealType?: MealType;
  rationType?: string;
}

export interface IConsumptionReportResponse {
  dogId: string;
  rationId: string;
  rationName: string;
  totalConsumed: number;
  unit: MeasurementUnit;
  startDate: string;
  endDate: string;
}

export interface IConsumptionReportParams {
  dogId?: string;
  startDate?: string;
  endDate?: string;
  rationType?: string;
}

