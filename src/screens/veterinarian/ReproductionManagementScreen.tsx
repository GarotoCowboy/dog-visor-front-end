import React, { useCallback, useState } from "react";
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
import { ReproductionItemCard } from "./components/reproduction/ReproductionItemCard";
import { CreateReproductionModal } from "./components/reproduction/CreateReproductionModal";
import { EditReproductionModal } from "./components/reproduction/EditReproductionModal";
import { ReproductionHeader } from "./components/reproduction/ReproductionHeader";
import { ReproductionSummaryCards } from "./components/reproduction/ReproductionSummaryCards";
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

  // Modais de Criação e Edição
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
        setReproductions(reprodRes.value);
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

  const handleCreateReproduction = async (payload: ICreateDogReproductionRequest) => {
    try {
      setSubmitting(true);
      await createDogReproductionService(payload);
      setIsCreateModalOpen(false);
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

  // Filtragem pela busca
  const filteredReproductions = reproductions.filter((item) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (item.dogsName && item.dogsName.toLowerCase().includes(term)) ||
      (item.dogsBreed && item.dogsBreed.toLowerCase().includes(term)) ||
      (item.observations && item.observations.toLowerCase().includes(term))
    );
  });

  // Estatísticas de resumo
  const monitoredFemalesCount = new Set(reproductions.map((r) => r.dogId)).size;
  const next30DaysCount = reproductions.filter((r) => {
    if (!r.expectedNextHeatDate) return false;
    const parts = r.expectedNextHeatDate.split("-");
    if (parts.length !== 3) return false;
    const d = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10),
    );
    const now = new Date();
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 30 && diff >= 0;
  }).length;

  return (
    <View style={styles.container}>
      {/* 1. HEADER: TÍTULO E BOTÃO REGISTRAR */}
      <ReproductionHeader onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      {/* 2. CARDS DE RESUMO */}
      <ReproductionSummaryCards
        monitoredFemalesCount={monitoredFemalesCount}
        next30DaysCount={next30DaysCount}
        totalRecords={reproductions.length}
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
              onEdit={(rec) => setEditingItem(rec)}
              onRequestDelete={handleRequestDelete}
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
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateReproduction}
        submitting={submitting}
        dogs={dogs}
        preselectedDog={preselectedDog}
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
