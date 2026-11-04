import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";

import { theme } from "../../../theme/theme";
import {
  createDogReproductionService,
  deleteDogReproductionService,
  listDogReproductionsService,
  listDogsService,
  updateDogReproductionService,
} from "../../service/api";
import FormComponent from "../../shared/components/FormComponent";
import { useAlert } from "../../hooks/useAlert";
import { IDogResponse } from "../../types/Dog";
import {
  ICreateDogReproductionRequest,
  IDogReproductionResponse,
  IUpdateDogReproductionRequest,
} from "../../types/DogHealth";
import {
  appendManualEndObservation,
  getExpectedNextHeatDate,
  parseLocalDate,
} from "../../utils/reproductionStatus";
import { ReproductionItemCard } from "./components/reproduction/ReproductionItemCard";
import { CreateReproductionModal } from "./components/reproduction/CreateReproductionModal";
import { EditReproductionModal } from "./components/reproduction/EditReproductionModal";
import { ReproductionHeader } from "./components/reproduction/ReproductionHeader";
import {
  ReproductionFilterMode,
  ReproductionSummaryCards,
} from "./components/reproduction/ReproductionSummaryCards";
import { ReproductionEmptyList } from "./components/reproduction/ReproductionEmptyList";

export const ReproductionManagementScreen = () => {
  const route = useRoute<any>();
  const preselectedDog = route.params?.preselectedDog as IDogResponse | undefined;
  const { showAlert, showConfirm, AlertModal } = useAlert();

  const [reproductions, setReproductions] = useState<IDogReproductionResponse[]>([]);
  const [dogs, setDogs] = useState<IDogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<ReproductionFilterMode>("ALL");

  // Modais de Criação e Edição
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalDogOverride, setModalDogOverride] = useState<IDogResponse | undefined>(
    undefined,
  );
  const [editingItem, setEditingItem] = useState<IDogReproductionResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reprodRes, dogsRes] = await Promise.allSettled([
        listDogReproductionsService(),
        listDogsService(),
      ]);

      if (reprodRes.status === "fulfilled" && Array.isArray(reprodRes.value)) {
        // Ordenar do mais recente para o mais antigo por data observada
        const sorted = [...reprodRes.value].sort((a, b) => {
          const da = parseLocalDate(a.date)?.getTime() ?? 0;
          const db = parseLocalDate(b.date)?.getTime() ?? 0;
          return db - da;
        });
        setReproductions(sorted);
      }
      if (dogsRes.status === "fulfilled" && Array.isArray(dogsRes.value)) {
        setDogs(dogsRes.value);
      }
    } catch (err) {
      console.log("Erro ao carregar dados reprodutivos:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      if (preselectedDog && preselectedDog.sex?.toUpperCase() === "F") {
        if (route.params?.openCreate === true) {
          setModalDogOverride(preselectedDog);
          setIsCreateModalOpen(true);
        } else {
          setSearch(preselectedDog.name || "");
        }
      }
    }, [preselectedDog, route.params?.openCreate]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Não informada";
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Identifica o registro mais recente de cada cadela
  const latestRecordByDogMap = useMemo(() => {
    const map = new Map<string, IDogReproductionResponse>();
    for (const item of reproductions) {
      const key = item.dogId || item.dogsName || item.id;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, item);
      } else {
        const existingDate = parseLocalDate(existing.date)?.getTime() ?? 0;
        const currentDate = parseLocalDate(item.date)?.getTime() ?? 0;
        if (currentDate >= existingDate) {
          map.set(key, item);
        }
      }
    }
    return map;
  }, [reproductions]);

  const latestRecordIds = useMemo(() => {
    return new Set(Array.from(latestRecordByDogMap.values()).map((r) => r.id));
  }, [latestRecordByDogMap]);

  const handleCreateReproduction = async (payload: ICreateDogReproductionRequest) => {
    const alreadyExists = reproductions.some(
      (r) =>
        (r.dogId && payload.dogId && r.dogId === payload.dogId) ||
        (r.dogsName &&
          payload.dogsName &&
          r.dogsName.trim().toLowerCase() === payload.dogsName.trim().toLowerCase()),
    );
    if (alreadyExists) {
      showAlert(
        "warning",
        "Controle Já Ativo",
        `A cadela "${payload.dogsName}" já possui um controle reprodutivo ativo. Edite o registro existente.`,
      );
      return;
    }

    try {
      setSubmitting(true);
      await createDogReproductionService(payload);
      setIsCreateModalOpen(false);
      setModalDogOverride(undefined);
      loadData();
      showAlert(
        "success",
        "Sucesso!",
        "O ciclo reprodutivo (cio) foi registrado com sucesso.",
      );
    } catch (err: any) {
      console.log("Erro ao registrar cio:", err);
      const message =
        err?.response?.data?.message ||
        "Não foi possível salvar o registro reprodutivo. Tente novamente.";
      showAlert("error", "Erro ao Salvar", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReproduction = async (
    id: string,
    payload: IUpdateDogReproductionRequest,
  ) => {
    try {
      setSubmitting(true);
      await updateDogReproductionService(id, payload);
      setEditingItem(null);
      loadData();
      showAlert(
        "success",
        "Atualizado!",
        "O registro reprodutivo foi atualizado com sucesso.",
      );
    } catch (err: any) {
      console.log("Erro ao atualizar cio:", err);
      const message =
        err?.response?.data?.message ||
        "Não foi possível atualizar o registro reprodutivo.";
      showAlert("error", "Erro ao Atualizar", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestEndHeat = (item: IDogReproductionResponse) => {
    showConfirm(
      "Encerrar Período de Cio",
      `Deseja marcar o período de cio atual da cadela "${item.dogsName}" como encerrado? A previsão do próximo ciclo (${formatDate(item.expectedNextHeatDate)}) será mantida.`,
      async () => {
        try {
          setLoading(true);
          await updateDogReproductionService(item.id, {
            date: item.date,
            expectedNextHeatDate: item.expectedNextHeatDate,
            cycleIntervalInMonths: item.cycleIntervalInMonths,
            observations: appendManualEndObservation(item.observations),
          });
          await loadData();
          showAlert(
            "success",
            "Cio Encerrado!",
            `O período de cio de "${item.dogsName}" foi marcado como encerrado.`,
          );
        } catch (err: any) {
          console.log("Erro ao encerrar cio:", err);
          const message =
            err?.response?.data?.message ||
            "Não foi possível encerrar o período de cio.";
          showAlert("error", "Erro ao Encerrar", message);
        } finally {
          setLoading(false);
        }
      },
      { confirmText: "Encerrar Cio", cancelText: "Cancelar" },
    );
  };

  const handleRegisterNewCycle = (item: IDogReproductionResponse) => {
    setEditingItem(item);
  };

  const handleRequestDelete = (item: IDogReproductionResponse) => {
    showConfirm(
      "Excluir Registro",
      `Tem certeza que deseja excluir o registro de cio da cadela "${item.dogsName}"?`,
      async () => {
        try {
          await deleteDogReproductionService(item.id);
          loadData();
          showAlert(
            "success",
            "Excluído!",
            "O registro de cio foi removido com sucesso.",
          );
        } catch (err) {
          console.log("Erro ao excluir registro reprodutivo:", err);
          showAlert(
            "error",
            "Erro ao Excluir",
            "Não foi possível excluir o registro. Verifique suas permissões e tente novamente.",
          );
        }
      },
      "Excluir",
      "Cancelar",
    );
  };

  const isWithinNext30Days = (r: IDogReproductionResponse): boolean => {
    const nextDate = getExpectedNextHeatDate(r);
    if (!nextDate) return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.ceil(
      (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays >= 0 && diffDays <= 30;
  };

  // Filtragem pela busca e pelo card selecionado (Todos vs Próximos 30 Dias)
  const filteredReproductions = reproductions.filter((item) => {
    if (filterMode === "NEXT_30_DAYS") {
      if (!latestRecordIds.has(item.id) || !isWithinNext30Days(item)) {
        return false;
      }
    }
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (item.dogsName && item.dogsName.toLowerCase().includes(term)) ||
      (item.dogsBreed && item.dogsBreed.toLowerCase().includes(term)) ||
      (item.observations && item.observations.toLowerCase().includes(term))
    );
  });

  // Estatísticas de resumo baseadas no ciclo mais recente de cada cadela
  const latestRecords = Array.from(latestRecordByDogMap.values());
  const monitoredFemalesCount = latestRecords.length;
  const next30DaysCount = latestRecords.filter(isWithinNext30Days).length;

  return (
    <View style={styles.container}>
      {/* 1. HEADER: TÍTULO E BOTÃO REGISTRAR */}
      <ReproductionHeader
        onOpenCreateModal={() => {
          setModalDogOverride(preselectedDog);
          setIsCreateModalOpen(true);
        }}
      />

      {/* 2. CARDS DE RESUMO */}
      <ReproductionSummaryCards
        monitoredFemalesCount={monitoredFemalesCount}
        next30DaysCount={next30DaysCount}
        filterMode={filterMode}
        onSelectFilter={setFilterMode}
      />

      {/* 3. BARRA DE PESQUISA */}
      <View style={styles.searchContainer}>
        <FormComponent
          placeholder="Pesquisar por cadela ou raça..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* 4. CONTEÚDO PRINCIPAL / LISTA */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando registros reprodutivos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReproductions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReproductionItemCard
              item={item}
              isLatestForDog={latestRecordIds.has(item.id)}
              onEdit={(rec) => setEditingItem(rec)}
              onRequestDelete={handleRequestDelete}
              onEndHeat={handleRequestEndHeat}
              onRegisterNewCycle={handleRegisterNewCycle}
              formatDate={formatDate}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={<ReproductionEmptyList search={search} />}
        />
      )}

      {/* MODAL DE CADASTRO DE CIO */}
      <CreateReproductionModal
        visible={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setModalDogOverride(undefined);
        }}
        onSubmit={handleCreateReproduction}
        submitting={submitting}
        dogs={dogs}
        existingReproductions={reproductions}
        preselectedDog={modalDogOverride ?? preselectedDog}
        onValidationAlert={(title, message) =>
          showAlert("warning", title, message)
        }
      />

      {/* MODAL DE EDIÇÃO */}
      <EditReproductionModal
        visible={editingItem !== null}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSubmit={handleUpdateReproduction}
        submitting={submitting}
        onValidationAlert={(title, message) =>
          showAlert("warning", title, message)
        }
      />

      {/* ALERTA CUSTOMIZADO */}
      <AlertModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchContainer: {
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 24,
    gap: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
    color: "#6B7280",
  },
});
