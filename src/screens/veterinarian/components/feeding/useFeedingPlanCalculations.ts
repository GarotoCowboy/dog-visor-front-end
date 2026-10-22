import { IFeedingPlanResponse, MealType } from "../../../../types/FeedingPlan";
import { IRationConsumptionEstimateResponse, IRationResponse } from "../../../../types/Ration";

interface UseFeedingPlanCalculationsProps {
  selectedRation: IRationResponse | null;
  rationEstimate: IRationConsumptionEstimateResponse | null;
  editingPlan?: IFeedingPlanResponse;
  mealQuantityGrams: number;
  selectedMealTypes: MealType[];
}

export const useFeedingPlanCalculations = ({
  selectedRation,
  rationEstimate,
  editingPlan,
  mealQuantityGrams,
  selectedMealTypes,
}: UseFeedingPlanCalculationsProps) => {
  const mealsCount = selectedMealTypes.length;
  const dogDailyIntakeGrams = mealQuantityGrams * mealsCount;
  const dogDailyIntakeKg = dogDailyIntakeGrams / 1000;

  const baseStockKg = selectedRation
    ? (selectedRation.currentRationQuantity || 0)
    : 0;

  const currentTotalDailyConsumptionKg =
    rationEstimate?.totalDailyConsumptionKg ||
    rationEstimate?.dailyConsumptionKg ||
    0;

  let projectedTotalDailyConsumptionKg = 0;
  if (
    editingPlan &&
    selectedRation &&
    String(editingPlan.rationId) === String(selectedRation.id)
  ) {
    const prevMealsCount = editingPlan.mealTypes?.length || 1;
    const prevDogIntakeKg =
      ((editingPlan.mealQuantityInGrams || 0) * prevMealsCount) / 1000;

    if (currentTotalDailyConsumptionKg > 0) {
      projectedTotalDailyConsumptionKg = Math.max(
        dogDailyIntakeKg,
        currentTotalDailyConsumptionKg - prevDogIntakeKg + dogDailyIntakeKg,
      );
    } else {
      projectedTotalDailyConsumptionKg = dogDailyIntakeKg;
    }
  } else {
    projectedTotalDailyConsumptionKg =
      currentTotalDailyConsumptionKg + dogDailyIntakeKg;
  }

  const projectedDaysRemaining =
    projectedTotalDailyConsumptionKg > 0
      ? Math.floor(baseStockKg / projectedTotalDailyConsumptionKg)
      : null;

  return {
    mealsCount,
    dogDailyIntakeKg,
    baseStockKg,
    projectedTotalDailyConsumptionKg,
    projectedDaysRemaining,
  };
};
