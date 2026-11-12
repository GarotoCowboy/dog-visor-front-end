import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../../routes";
import { SCREENS } from "../../consts/screens";
import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  IRationConsumptionEstimateResponse,
  IRationResponse,
} from "../../types/Ration";
import { IFeedingPlanResponse } from "../../types/FeedingPlan";
import {
  applyDailyConsumptionAllService,
  applyDailyConsumptionService,
  deleteDogRation,
  getAllRationEstimates,
  getDogRation,
  listFeedingPlansService,
} from "../../service/api";
import { theme } from "../../../theme/theme";
import { FontAwesomeFreeSolid } from "@react-native-vector-icons/fontawesome-free-solid";
import { EditRationFormComponent } from "./components/EditRationFormComponent";
import { RationSummaryCards } from "./components/rations/RationSummaryCards";
import { RationItemCard } from "./components/rations/RationItemCard";
import { useAlert } from "../../hooks/useAlert";

type RationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof SCREENS.RATIONS_SCREEN
>;

export const RationScreen = () => {
  const navigation = useNavigation<RationScreenNavigationProp>();
  const { showAlert, showConfirm, AlertModal } = useAlert();

  const [rations, setRations] = useState<IRationResponse[]>([]);
  const [estimates, setEstimates] = useState<
    Record<string, IRationConsumptionEstimateResponse>
  >({});
  const [feedingPlans, setFeedingPlans] = useState<IFeedingPlanResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [openIncreaseRationForm, setOpenIncreaseRationForm] = useState(false);
  const [openDecreaseRationForm, setOpenDecreaseRationForm] = useState(false);
  const [rationToUpdateId, setRationToUpdateId] = useState<string | null>(null);

  const loadingRations = async () => {
    try {
      setLoading(true);
      const [data, ests, plans] = await Promise.all([
        getDogRation(),
        getAllRationEstimates().catch(() => []),
        listFeedingPlansService().catch(() => []),
      ]);
      setRations(data);
      setFeedingPlans(Array.isArray(plans) ? plans : []);

      if (Array.isArray(ests)) {
        const map: Record<string, IRationConsumptionEstimateResponse> = {};
        ests.forEach((e) => {
          if (e.rationId) map[String(e.rationId)] = e;
        });
        setEstimates(map);
      }
    } catch (error) {
      console.error("Erro ao buscar ração", error);
      showAlert(
        "error",
        "Erro ao buscar rações",
        "Não foi possível carregar a lista de rações. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDailyDeduction = (item: IRationResponse) => {
    const est = estimates[String(item.id)];
    const dailyKg =
      est?.totalDailyConsumptionKg ?? est?.dailyConsumptionKg ?? 0;
    const todayStr = new Date().toISOString().split("T")[0];
    const isAppliedToday = Boolean(
      est?.dailyDeductionAppliedToday ||
        (item.lastDailyDeductionDate &&
          item.lastDailyDeductionDate === todayStr),
    );

    if (isAppliedToday) {
      showAlert(
        "warning",
        "Baixa Já Realizada",
        `A baixa diária para a ração "${item.name}" já foi realizada hoje. O consumo não será debitado novamente.`,
      );
      return;
    }

    if (dailyKg <= 0) {
      showAlert(
        "warning",
        "Sem Consumo Previsto",
        `Não há planos alimentares ativos consumindo a ração "${item.name}" hoje.`,
      );
      return;
    }

    showConfirm(
      "Confirmar Baixa Diária",
      `Deseja dar baixa diária de ${dailyKg.toFixed(2)} kg na ração "${item.name}" referente ao consumo planejado para hoje?`,
      async () => {
        try {
          setLoading(true);
          await applyDailyConsumptionService(String(item.id));
          await loadingRations();
          showAlert(
            "success",
            "Baixa Realizada",
            `Baixa diária de ${dailyKg.toFixed(2)} kg registrada com sucesso!`,
          );
        } catch (error: any) {
          console.error("Erro ao dar baixa diária", error);
          const message =
            error?.response?.data?.message ||
            "Não foi possível abater o consumo diário da ração. Tente novamente.";
          showAlert("error", "Erro na Baixa Diária", message);
        } finally {
          setLoading(false);
        }
      },
      { confirmText: "Confirmar" },
    );
  };

  const handleRequestBatchDeduction = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const pendingRations = rations.filter((r) => {
      const est = estimates[String(r.id)];
      const dailyKg =
        est?.totalDailyConsumptionKg ?? est?.dailyConsumptionKg ?? 0;
      const isAppliedToday = Boolean(
        est?.dailyDeductionAppliedToday ||
          (r.lastDailyDeductionDate && r.lastDailyDeductionDate === todayStr),
      );
      return dailyKg > 0 && !isAppliedToday;
    });

    if (pendingRations.length === 0) {
      showAlert(
        "warning",
        "Todas as Baixas em Dia",
        "Todas as rações com planos ativos já tiveram a baixa diária realizada hoje!",
      );
      return;
    }

    const pendingTotalDaily = pendingRations.reduce((sum, r) => {
      const est = estimates[String(r.id)];
      return (
        sum + (est?.totalDailyConsumptionKg ?? est?.dailyConsumptionKg ?? 0)
      );
    }, 0);

    showConfirm(
      "Confirmar Baixa Geral",
      `Deseja dar baixa no consumo diário de ${pendingRations.length} ração(ões) pendente(s) hoje (Total: ${pendingTotalDaily.toFixed(2)} kg)?`,
      async () => {
        try {
          setLoading(true);
          const updated = await applyDailyConsumptionAllService();
          await loadingRations();
          showAlert(
            "success",
            "Baixa Geral Concluída",
            `Baixa diária aplicada com sucesso a ${updated.length} rações!`,
          );
        } catch (error: any) {
          console.error("Erro na baixa diária em lote", error);
          const message =
            error?.response?.data?.message ||
            "Não foi possível abater o consumo diário de todas as rações.";
          showAlert("error", "Erro na Baixa Geral", message);
        } finally {
          setLoading(false);
        }
      },
      { confirmText: "Confirmar" },
    );
  };

  const confirmDeleteRation = (id: string) => {
    const rationItem = rations.find((r) => String(r.id) === String(id));
    const est = estimates[String(id)];
    const plansUsingRation = feedingPlans.filter(
      (p) => String(p.rationId) === String(id),
    );
    const estDogsCount = est?.dogConsumptions?.length ?? 0;
    const dailyKg =
      est?.totalDailyConsumptionKg ?? est?.dailyConsumptionKg ?? 0;
    const linkedCount = Math.max(plansUsingRation.length, estDogsCount);

    if (linkedCount > 0 || dailyKg > 0) {
      const rationLabel = rationItem?.name ? `"${rationItem.name}"` : "selecionada";
      showAlert(
        "warning",
        "Ração em Uso",
        linkedCount > 0
          ? `Não é possível excluir a ração ${rationLabel} pois ela está vinculada a ${linkedCount} plano(s) alimentar(es) ativo(s). Altere a ração nos planos alimentares desses cães antes de excluí-la.`
          : `Não é possível excluir a ração ${rationLabel} pois existem planos alimentares ativos consumindo ${dailyKg.toFixed(2)} kg/dia dela. Altere a ração nos planos alimentares antes de excluí-la.`,
      );
      return;
    }

    showConfirm(
      "Confirmar exclusão",
      "Tem certeza que deseja deletar esta ração?",
      async () => {
        try {
          setLoading(true);
          await deleteDogRation(id);
          setRations((prev) =>
            prev.filter((item) => String(item.id) !== String(id)),
          );
          showAlert("success", "Sucesso", "Ração deletada com sucesso.");
        } catch (error: any) {
          console.error("Erro ao deletar ração", error);
          const backendMsg = error?.response?.data?.message;
          showAlert(
            "error",
            "Erro ao deletar ração",
            backendMsg ||
              "Não foi possível remover a ração. Verifique se não há planos alimentares vinculados e tente novamente.",
          );
        } finally {
          setLoading(false);
        }
      },
      { confirmText: "Deletar" },
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadingRations();
    }, []),
  );

  const handleToCreateRationScreen = () => {
    navigation.navigate(SCREENS.CREATE_RATIONS_SCREEN);
  };

  const handleIncreaseRation = (id: string) => {
    setRationToUpdateId(id);
    setOpenIncreaseRationForm(true);
  };

  const handleDecreaseRation = (id: string) => {
    setRationToUpdateId(id);
    setOpenDecreaseRationForm(true);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const totalDailyConsumptionAll = Object.values(estimates).reduce(
    (sum, e) => sum + (e.totalDailyConsumptionKg ?? e.dailyConsumptionKg ?? 0),
    0,
  );

  const pendingBatchRations = rations.filter((r) => {
    const est = estimates[String(r.id)];
    const dailyKg =
      est?.totalDailyConsumptionKg ?? est?.dailyConsumptionKg ?? 0;
    const isAppliedToday = Boolean(
      est?.dailyDeductionAppliedToday ||
        (r.lastDailyDeductionDate && r.lastDailyDeductionDate === todayStr),
    );
    return dailyKg > 0 && !isAppliedToday;
  });

  const allDeductedToday =
    rations.length > 0 &&
    rations.some((r) => {
      const est = estimates[String(r.id)];
      return (
        (est?.totalDailyConsumptionKg ?? est?.dailyConsumptionKg ?? 0) > 0
      );
    }) &&
    pendingBatchRations.length === 0;



  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : (
        <View style={styles.flatListContainer}>
          <RationSummaryCards
            totalDailyConsumptionAll={totalDailyConsumptionAll}
            allDeductedToday={allDeductedToday}
            pendingBatchCount={pendingBatchRations.length}
            onRequestBatchDeduction={handleRequestBatchDeduction}
          />

          <FlatList
            data={rations}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma ração encontrada.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <RationItemCard
                item={item}
                estimate={estimates[String(item.id)]}
                todayStr={todayStr}
                onRequestDailyDeduction={() =>
                  handleRequestDailyDeduction(item)
                }
                onIncrease={() => handleIncreaseRation(String(item.id))}
                onDecrease={() => handleDecreaseRation(String(item.id))}
                onDelete={() => confirmDeleteRation(String(item.id))}
              />
            )}
          />

          <TouchableOpacity
            style={styles.floatingButton}
            onPress={handleToCreateRationScreen}
            activeOpacity={0.8}
          >
            <FontAwesomeFreeSolid
              name="add"
              size={20}
              color={theme.colors.accent}
            />
          </TouchableOpacity>

          <EditRationFormComponent
            isVisible={openIncreaseRationForm}
            onClose={() => setOpenIncreaseRationForm(false)}
            rationId={rationToUpdateId}
            onShowAlert={showAlert}
            onSuccess={() => {
              loadingRations();
              showAlert(
                "success",
                "Sucesso",
                "Estoque atualizado com sucesso.",
              );
            }}
            text="Adicionar Ração"
            type="Increase"
          />

          <EditRationFormComponent
            isVisible={openDecreaseRationForm}
            onClose={() => setOpenDecreaseRationForm(false)}
            rationId={rationToUpdateId}
            onShowAlert={showAlert}
            onSuccess={() => {
              loadingRations();
              showAlert(
                "success",
                "Sucesso",
                "Baixa realizada com sucesso.",
              );
            }}
            text="Remover Ração"
            type="Decrease"
          />

          <AlertModal />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  activityIndicatorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  flatListContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  flatListContent: {
    paddingBottom: 90,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary,
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 24,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.md,
  },
});

export default RationScreen;