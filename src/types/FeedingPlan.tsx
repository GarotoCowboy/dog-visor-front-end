export enum MealType {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  POST_TRAINING = "POST_TRAINING",
  SNACK = "SNACK",
}

export const MealTypeLabel: Record<MealType, string> = {
  [MealType.BREAKFAST]: "Café da manhã",
  [MealType.LUNCH]: "Almoço",
  [MealType.DINNER]: "Jantar",
  [MealType.POST_TRAINING]: "Pós-treino",
  [MealType.SNACK]: "Lanche",
};

export enum MeasurementUnit {
  GRAM = "GRAM",
  KILOGRAM = "KILOGRAM",
}

export interface ICreateFeedingPlanRequest {
  dogId: string;
  rationId: string;
  name: string;
  goal: string;
  mealQuantityInGrams: number;
  unit?: MeasurementUnit;
  mealTypes: MealType[];
  dietaryRestriction?: string;
  notes?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  active?: boolean;
}

export interface IUpdateFeedingPlanRequest {
  rationId?: string;
  name?: string;
  goal?: string;
  mealQuantityInGrams?: number;
  unit?: MeasurementUnit;
  mealTypes?: MealType[];
  dietaryRestriction?: string;
  notes?: string;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

export interface IFeedingPlanResponse {
  id: string;
  dogId: string;
  rationId: string;
  rationName: string;
  rationType: string;
  name: string;
  goal: string;
  mealQuantityInGrams: number;
  unit: MeasurementUnit;
  mealTypes: MealType[];
  dietaryRestriction?: string;
  notes?: string;
  startDate: string;
  endDate?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
