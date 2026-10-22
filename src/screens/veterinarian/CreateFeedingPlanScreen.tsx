import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { theme } from "../../../theme/theme";
import { Button } from "../../shared/components/ButtonComponent";
import { useAlert } from "../../hooks/useAlert";
import {
  EDOG_STATUS,
  IDogResponse,
} from "../../types/Dog";
import {
  IRationConsumptionEstimateResponse,
  IRationResponse,
} from "../../types/Ration";
import {
  ICreateFeedingPlanRequest,
  IFeedingPlanResponse,
  MealType,
  MeasurementUnit,
} from "../../types/FeedingPlan";
import {
  createFeedingPlanService,
  getDogRation,
  getRationEstimateById,
  listDogsService,
  listFeedingPlansService,
  updateFeedingPlanService,
} from "../../service/api";
import { SelectDogModal } from "./components/feeding/SelectDogModal";
import { SelectRationModal } from "./components/feeding/SelectRationModal";
import { FeedingForecastCard } from "./components/feeding/FeedingForecastCard";
import { MealQuantityStepper } from "./components/feeding/MealQuantityStepper";
import { MealTypesSelector } from "./components/feeding/MealTypesSelector";
import { FeedingPlanDogRationSelector } from "./components/feeding/FeedingPlanDogRationSelector";
import { FeedingPlanBasicInfoSection } from "./components/feeding/FeedingPlanBasicInfoSection";
import { FeedingPlanRestrictionsSection } from "./components/feeding/FeedingPlanRestrictionsSection";
import { FeedingPlanDatesSection } from "./components/feeding/FeedingPlanDatesSection";
import { useFeedingPlanCalculations } from "./components/feeding/useFeedingPlanCalculations";

type RouteParams = {
  CreateFeedingPlanScreen: {
    selectedDog?: IDogResponse;
    editingPlan?: IFeedingPlanResponse;
  };
};

export const CreateFeedingPlanScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, "CreateFeedingPlanScreen">>();
  const { showAlert, AlertModal } = useAlert();

  const initialDog = route.params?.selectedDog;
  const editingPlan = route.params?.editingPlan;

  const [dogs, setDogs] = useState<IDogResponse[]>([]);
  const [rations, setRations] = useState<IRationResponse[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Campos do formulário
  const [selectedDog, setSelectedDog] = useState<IDogResponse | null>(
    initialDog || null,
  );
  const [selectedRation, setSelectedRation] = useState<IRationResponse | null>(
    null,
  );
  const [planName, setPlanName] = useState(
    editingPlan?.name || "Plano Alimentar Regular",
  );
  const [goal, setGoal] = useState(
    editingPlan?.goal || "Manutenção do peso e energia para treino",
  );
  const [mealQuantityGrams, setMealQuantityGrams] = useState<number>(
    editingPlan?.mealQuantityInGrams || 175,
  );
  const [selectedMealTypes, setSelectedMealTypes] = useState<MealType[]>(
    editingPlan?.mealTypes && editingPlan.mealTypes.length > 0
      ? editingPlan.mealTypes
      : [MealType.BREAKFAST, MealType.DINNER],
  );
  const [dietaryRestriction, setDietaryRestriction] = useState(
    editingPlan?.dietaryRestriction || "",
  );
  const [notes, setNotes] = useState(editingPlan?.notes || "");

  // Datas
  const [startDate, setStartDate] = useState<Date>(
    editingPlan?.startDate ? new Date(editingPlan.startDate) : new Date(),
  );
  const [isStartDatePickerVisible, setIsStartDatePickerVisible] =
    useState(false);

  const [hasEndDate, setHasEndDate] = useState(Boolean(editingPlan?.endDate));
  const [endDate, setEndDate] = useState<Date>(
    editingPlan?.endDate
      ? new Date(editingPlan.endDate)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  );
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);

  // Modais de Seleção (Dropdown)
  const [isDogModalOpen, setIsDogModalOpen] = useState(false);
  const [isRationModalOpen, setIsRationModalOpen] = useState(false);

  // Planos alimentares já cadastrados para validação de unicidade
  const [existingPlans, setExistingPlans] = useState<IFeedingPlanResponse[]>([]);

  // Estimativa da Ração Selecionada (vinda do backend)
  const [rationEstimate, setRationEstimate] =
    useState<IRationConsumptionEstimateResponse | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);


  // Carrega lista de cães, rações e planos alimentares já existentes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [dogsRes, rationsRes, plansRes] = await Promise.allSettled([
          listDogsService(),
          getDogRation(),
          listFeedingPlansService(),
        ]);

        if (dogsRes.status === "fulfilled" && Array.isArray(dogsRes.value)) {
          setDogs(dogsRes.value);
        }

        if (
          rationsRes.status === "fulfilled" &&
          Array.isArray(rationsRes.value)
        ) {
          setRations(rationsRes.value);

          // Se estiver editando, pré-seleciona a ração do plano
          if (editingPlan && editingPlan.rationId) {
            const foundRation = rationsRes.value.find(
              (r) => String(r.id) === String(editingPlan.rationId),
            );
            if (foundRation) setSelectedRation(foundRation);
          }
        }

        if (plansRes.status === "fulfilled" && Array.isArray(plansRes.value)) {
          setExistingPlans(plansRes.value);
        }
      } catch (err) {
        console.log("Erro ao carregar dados do formulário:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [editingPlan]);

  // Se o cão inicial foi passado via rota, preenche caso ainda não esteja selecionado
  useEffect(() => {
    if (initialDog && !selectedDog) {
      setSelectedDog(initialDog);
    }
  }, [initialDog, selectedDog]);

  // Atualiza estimativa da ração quando a ração for selecionada
  useEffect(() => {
    const fetchEstimate = async () => {
      if (!selectedRation || !selectedRation.id) {
        setRationEstimate(null);
        return;
      }

      try {
        setLoadingEstimate(true);
        const estimate = await getRationEstimateById(selectedRation.id);
        setRationEstimate(estimate);
      } catch (err) {
        console.log("Erro ao buscar estimativa da ração:", err);
        setRationEstimate(null);
      } finally {
        setLoadingEstimate(false);
      }
    };

    fetchEstimate();
  }, [selectedRation]);

  const toggleMealType = (type: MealType) => {
    if (selectedMealTypes.includes(type)) {
      if (selectedMealTypes.length === 1) {
        showAlert(
          "warning",
          "Atenção",
          "O plano precisa de pelo menos 1 refeição configurada.",
        );
        return;
      }
      setSelectedMealTypes((prev) => prev.filter((t) => t !== type));
    } else {
      setSelectedMealTypes((prev) => [...prev, type]);
    }
  };

  const isDogInKennel = (d: IDogResponse): boolean => {
    if (d.onKennel !== undefined) return Boolean(d.onKennel);
    if ((d as any).inKennel !== undefined) return Boolean((d as any).inKennel);
    if ((d as any).isKennel !== undefined) return Boolean((d as any).isKennel);
    return (
      d.status !== EDOG_STATUS.DOADO && d.status !== EDOG_STATUS.FALECIDO
    );
  };

  const dogHasActivePlan = (dogId?: string): boolean => {
    if (!dogId) return false;
    return existingPlans.some((p) => {
      const pDogId = p.dogId;
      return String(pDogId) === String(dogId);
    });
  };

  const handleSelectDog = (dog: IDogResponse) => {
    const dogId = dog.ID;

    if (!isDogInKennel(dog)) {
      showAlert(
        "warning",
        "Cão Fora do Canil",
        "Os cães para serem alimentados precisam estar no canil. O cão selecionado não reside no canil.",
      );
      return;
    }

    if (!editingPlan && dogHasActivePlan(dogId)) {
      showAlert(
        "warning",
        "Plano Já Cadastrado",
        `O cão ${dog.name} já possui um plano alimentar cadastrado. Cães que já possuem plano alimentar não podem ter outro.`,
      );
      return;
    }

    setSelectedDog(dog);
  };

  const {
    mealsCount,
    dogDailyIntakeKg,
    baseStockKg,
    projectedTotalDailyConsumptionKg,
    projectedDaysRemaining,
  } = useFeedingPlanCalculations({
    selectedRation,
    rationEstimate,
    editingPlan,
    mealQuantityGrams,
    selectedMealTypes,
  });

  const handleSubmit = async () => {
    if (!selectedDog) {
      showAlert(
        "warning",
        "Cão Obrigatório",
        "Por favor, selecione um cão para criar o plano alimentar.",
      );
      return;
    }

    const dogId = selectedDog.ID;

    if (!isDogInKennel(selectedDog)) {
      showAlert(
        "warning",
        "Cão Fora do Canil",
        "Os cães para serem alimentados precisam estar no canil. O cão selecionado não reside no canil.",
      );
      return;
    }

    if (!editingPlan && dogHasActivePlan(dogId)) {
      showAlert(
        "warning",
        "Plano Já Existente",
        `O cão ${selectedDog.name} já possui um plano alimentar cadastrado. Cães que já possuem plano alimentar não podem ter outro.`,
      );
      return;
    }

    if (!selectedRation) {
      showAlert(
        "warning",
        "Ração Obrigatória",
        "Por favor, selecione a ração que será utilizada no plano.",
      );
      return;
    }

    if (!planName.trim()) {
      showAlert(
        "warning",
        "Nome do Plano",
        "Por favor, defina um nome para o plano alimentar.",
      );
      return;
    }

    if (!goal.trim()) {
      showAlert(
        "warning",
        "Objetivo",
        "Por favor, defina o objetivo nutricional do plano.",
      );
      return;
    }

    if (mealQuantityGrams <= 0) {
      showAlert(
        "warning",
        "Quantidade Inválida",
        "A quantidade por refeição deve ser maior que zero.",
      );
      return;
    }

    if (selectedMealTypes.length === 0) {
      showAlert(
        "warning",
        "Refeição Obrigatória",
        "Selecione ao menos um horário/tipo de refeição.",
      );
      return;
    }

    const pad = (n: number) => String(n).padStart(2, "0");
    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const payload: ICreateFeedingPlanRequest = {
      dogId: selectedDog.ID,
      rationId: String(selectedRation.id),
      name: planName.trim(),
      goal: goal.trim(),
      mealQuantityInGrams: Number(mealQuantityGrams),
      unit: MeasurementUnit.GRAM,
      mealTypes: selectedMealTypes,
      dietaryRestriction: dietaryRestriction.trim() || undefined,
      notes: notes.trim() || undefined,
      startDate: formatDate(startDate),
      endDate: hasEndDate ? formatDate(endDate) : undefined,
    };

    try {
      setSubmitting(true);
      if (editingPlan) {
        await updateFeedingPlanService(editingPlan.id, payload);
        showAlert(
          "success",
          "Plano Atualizado",
          "O plano alimentar foi atualizado com sucesso!",
          { onConfirm: () => navigation.goBack() },
        );
      } else {
        await createFeedingPlanService(payload);
        showAlert(
          "success",
          "Plano Criado",
          "O plano alimentar foi cadastrado com sucesso!",
          { onConfirm: () => navigation.goBack() },
        );
      }
    } catch (err: any) {
      console.log("Erro ao salvar plano alimentar:", err);
      showAlert(
        "error",
        "Erro ao Salvar",
        err.response?.data?.message ||
          "Não foi possível salvar o plano alimentar. Verifique a conexão com o servidor.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      {/* 1. SELEÇÃO DO CÃO E RAÇÃO */}
      <FeedingPlanDogRationSelector
        selectedDog={selectedDog}
        onOpenDogModal={() => setIsDogModalOpen(true)}
        selectedRation={selectedRation}
        onOpenRationModal={() => setIsRationModalOpen(true)}
      />

      {/* 2. PAINEL DE PREVISÃO DE GASTO DIÁRIO */}
      {selectedRation && (
        <FeedingForecastCard
          baseStockKg={baseStockKg}
          dogDailyIntakeKg={dogDailyIntakeKg}
          mealQuantityGrams={mealQuantityGrams}
          mealsCount={mealsCount}
          projectedTotalDailyConsumptionKg={projectedTotalDailyConsumptionKg}
          projectedDaysRemaining={projectedDaysRemaining}
          loadingEstimate={loadingEstimate}
        />
      )}

      {/* 3. QUANTIDADE POR REFEIÇÃO */}
      <MealQuantityStepper
        mealQuantityGrams={mealQuantityGrams}
        onIncrement={() => setMealQuantityGrams((q) => q + 10)}
        onDecrement={() => setMealQuantityGrams((q) => Math.max(10, q - 10))}
      />

      {/* 4. TIPOS DE REFEIÇÃO */}
      <MealTypesSelector
        selectedMealTypes={selectedMealTypes}
        onToggleMealType={toggleMealType}
      />

      {/* 5. NOME DO PLANO E OBJETIVO */}
      <FeedingPlanBasicInfoSection
        planName={planName}
        setPlanName={setPlanName}
        goal={goal}
        setGoal={setGoal}
      />

      {/* 6. RESTRIÇÕES ALIMENTARES E OBSERVAÇÕES */}
      <FeedingPlanRestrictionsSection
        dietaryRestriction={dietaryRestriction}
        setDietaryRestriction={setDietaryRestriction}
        notes={notes}
        setNotes={setNotes}
      />

      {/* 7. DATAS DE INÍCIO E TÉRMINO */}
      <FeedingPlanDatesSection
        startDate={startDate}
        setStartDate={setStartDate}
        isStartDatePickerVisible={isStartDatePickerVisible}
        setIsStartDatePickerVisible={setIsStartDatePickerVisible}
        hasEndDate={hasEndDate}
        setHasEndDate={setHasEndDate}
        endDate={endDate}
        setEndDate={setEndDate}
        isEndDatePickerVisible={isEndDatePickerVisible}
        setIsEndDatePickerVisible={setIsEndDatePickerVisible}
      />

      {/* 8. BOTÃO DE SUBMISSÃO */}
      <View style={styles.submitSection}>
        <Button
          text={
            submitting
              ? "Salvando..."
              : editingPlan
              ? "Atualizar Plano Alimentar"
              : "Criar Plano Alimentar"
          }
          onPress={handleSubmit}
          disabled={submitting}
        />
      </View>

      {/* MODAL DE SELEÇÃO DE CÃO */}
      <SelectDogModal
        visible={isDogModalOpen}
        onClose={() => setIsDogModalOpen(false)}
        dogs={dogs}
        selectedDog={selectedDog}
        onSelectDog={handleSelectDog}
        isDogInKennel={isDogInKennel}
        dogHasActivePlan={dogHasActivePlan}
      />

      {/* MODAL DE SELEÇÃO DE RAÇÃO */}
      <SelectRationModal
        visible={isRationModalOpen}
        onClose={() => setIsRationModalOpen(false)}
        rations={rations}
        selectedRation={selectedRation}
        onSelectRation={(rat) => setSelectedRation(rat)}
      />

      {/* ALERTA CUSTOMIZADO */}
      <AlertModal />
    </ScrollView>
  </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  submitSection: {
    marginTop: 10,
    marginBottom: 20,
  },
});
