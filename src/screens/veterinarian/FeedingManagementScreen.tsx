import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../theme/theme";
import { useAlert } from "../../hooks/useAlert";
import { SCREENS } from "../../consts/screens";
import { RootStackParamList } from "../../routes";
import {
  DogRaceLabel,
  EDOG_STATUS,
  IDogResponse,
} from "../../types/Dog";
import { IFeedingPlanResponse } from "../../types/FeedingPlan";
import {
  listDogsService,
  listFeedingPlansService,
  updateFeedingPlanService,
} from "../../service/api";
import { FeedingDogCard } from "./components/feeding/FeedingDogCard";
import { FeedingManagementFilterRow } from "./components/feeding/FeedingManagementFilterRow";

export const FeedingManagementScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { showAlert, AlertModal } = useAlert();

  const [dogs, setDogs] = useState<IDogResponse[]>([]);
  const [plans, setPlans] = useState<IFeedingPlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"kennel" | "all">("kennel");

  // Armazena quantidades locais para atualização otimista/debounce
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>(
    {},
  );
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [dogsData, plansData] = await Promise.allSettled([
        listDogsService(),
        listFeedingPlansService(),
      ]);

      if (dogsData.status === "fulfilled" && Array.isArray(dogsData.value)) {
        setDogs(dogsData.value);
      }
      if (plansData.status === "fulfilled" && Array.isArray(plansData.value)) {
        setPlans(plansData.value);
        const qMap: Record<string, number> = {};
        plansData.value.forEach((p) => {
          if (p.dogId && p.mealQuantityInGrams) {
            qMap[p.dogId] = p.mealQuantityInGrams;
          }
        });
        setLocalQuantities(qMap);
      }
    } catch (err) {
      console.log("Erro ao carregar dados de alimentação:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const isDogInKennel = (dog: IDogResponse) => {
    if (dog.onKennel !== undefined && dog.onKennel !== null) {
      return Boolean(dog.onKennel);
    }
    if (dog.on_kennel !== undefined && dog.on_kennel !== null) {
      return Boolean(dog.on_kennel);
    }
    if (dog.inKennel !== undefined && dog.inKennel !== null) {
      return Boolean(dog.inKennel);
    }
    return dog.status === EDOG_STATUS.TREINAMENTO;
  };

  const getDogPlan = (dogId: string) => {
    return plans.find((p) => p.dogId === dogId && p.active !== false);
  };

  const handleAdjustQuantity = (dog: IDogResponse, delta: number) => {
    const plan = getDogPlan(dog.ID);
    if (!plan) {
      showAlert(
        "warning",
        "Plano Inexistente",
        "Este cão ainda não possui um plano alimentar cadastrado. Clique no ícone de lápis ou no botão '+' para criar um novo plano.",
      );
      return;
    }

    const currentQtd =
      localQuantities[dog.ID] !== undefined
        ? localQuantities[dog.ID]
        : plan.mealQuantityInGrams || 100;

    const newQtd = Math.max(10, currentQtd + delta);

    // Atualização otimista imediata na UI
    setLocalQuantities((prev) => ({
      ...prev,
      [dog.ID]: newQtd,
    }));

    // Debounce da persistência no backend (500ms)
    if (debounceTimers.current[plan.id]) {
      clearTimeout(debounceTimers.current[plan.id]);
    }

    debounceTimers.current[plan.id] = setTimeout(async () => {
      try {
        await updateFeedingPlanService(plan.id, {
          mealQuantityInGrams: newQtd,
        });
      } catch (err) {
        console.log("Erro ao atualizar quantidade da refeição:", err);
      }
    }, 500);
  };

  const handleEditPlan = (dog: IDogResponse, plan?: IFeedingPlanResponse) => {
    if (!isDogInKennel(dog)) {
      showAlert(
        "warning",
        "Cão Fora do Canil",
        "Os cães para serem alimentados precisam estar no canil. Apenas cães em treinamento/canil podem receber planos alimentares.",
      );
      return;
    }

    (navigation as any).navigate(SCREENS.CREATE_FEEDING_PLAN_SCREEN, {
      selectedDog: dog,
      editingPlan: plan,
    });
  };

  const handleCreateNewPlan = () => {
    (navigation as any).navigate(SCREENS.CREATE_FEEDING_PLAN_SCREEN);
  };

  const dogsWithPlan = dogs.filter((dog) => Boolean(getDogPlan(dog.ID)));
  const kennelDogsWithPlan = dogsWithPlan.filter((d) => isDogInKennel(d));

  const displayedDogs = (
    filterMode === "kennel" ? kennelDogsWithPlan : dogsWithPlan
  ).filter((dog) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    const raceName = dog.race ? DogRaceLabel[dog.race]?.toLowerCase() : "";
    const plan = getDogPlan(dog.ID);
    const rationName = plan?.rationName?.toLowerCase() || "";
    return (
      dog.name.toLowerCase().includes(term) ||
      raceName.includes(term) ||
      rationName.includes(term)
    );
  });

  return (
    <View style={styles.container}>
      {/* FILTROS E PESQUISA */}
      <FeedingManagementFilterRow
        search={search}
        onChangeSearch={setSearch}
        filterMode={filterMode}
        onChangeFilterMode={setFilterMode}
        kennelDogsCount={kennelDogsWithPlan.length}
        allDogsCount={dogsWithPlan.length}
      />

      {/* LISTAGEM DE CÃES */}
      {loading && !refreshing ? (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedDogs}
          keyExtractor={(item) => item.ID.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialDesignIcons
                name="food-drumstick-outline"
                size={52}
                color={theme.colors.secondary}
              />
              <Text style={styles.emptyTitle}>
                Nenhum plano alimentar cadastrado
              </Text>
              <Text style={styles.emptyText}>
                {search.trim()
                  ? "Nenhum plano alimentar encontrado para a busca informada."
                  : filterMode === "kennel"
                  ? "Nenhum cão do canil possui plano alimentar cadastrado no momento."
                  : "Nenhum plano alimentar cadastrado no momento."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <FeedingDogCard
              dog={item}
              plan={getDogPlan(item.ID)}
              inKennel={isDogInKennel(item)}
              currentQuantity={
                localQuantities[item.ID] !== undefined
                  ? localQuantities[item.ID]
                  : getDogPlan(item.ID)?.mealQuantityInGrams || 150
              }
              onEditPlan={() => handleEditPlan(item, getDogPlan(item.ID))}
              onAdjustQuantity={(delta) => handleAdjustQuantity(item, delta)}
            />
          )}
        />
      )}

      {/* FAB - BOTÃO NOVO PLANO */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={handleCreateNewPlan}
        activeOpacity={0.85}
      >
        <FontAwesomeFreeSolid
          name="plus"
          size={16}
          color={theme.colors.white}
        />
        <Text style={styles.fabButtonText}>Novo Plano</Text>
      </TouchableOpacity>

      {/* ALERTA CUSTOMIZADO */}
      <AlertModal />
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 90,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: "center",
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.secondary,
    textAlign: "center",
    lineHeight: 18,
  },
  fabButton: {
    position: "absolute",
    bottom: 24,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.md,
  },
  fabButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
});

export default FeedingManagementScreen;
